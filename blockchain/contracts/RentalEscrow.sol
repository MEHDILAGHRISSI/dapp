// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RentalEscrow Multi-Location
 * @dev Contrat flexible pour gérer plusieurs locations simultanément
 * @notice UN SEUL contrat pour TOUTES vos locations !
 */
contract RentalEscrowMulti {

    // ========================= ENUMS =========================
    enum State { Created, Funded, Active, Completed, Cancelled }

    // ========================= STRUCTURES =========================
    struct Booking {
        uint256 id;
        address payable owner;          // Propriétaire du logement
        address payable tenant;         // Locataire
        uint256 rentAmount;             // Montant du loyer en Wei
        uint256 leaseStart;             // Timestamp de début
        uint256 leaseEnd;               // Timestamp de fin
        uint256 platformFeePercent;     // Frais plateforme (peut varier par booking)
        State state;                    // État actuel de la réservation
        bool exists;                    // Pour vérifier l'existence
        bool locked;                    // Protection reentrancy par booking
    }

    // ========================= STORAGE =========================
    mapping(uint256 => Booking) public bookings;
    address payable public platformOwner;  // Propriétaire de la plateforme
    uint256 public defaultPlatformFeePercent = 5; // Frais par défaut
    uint256 private nextBookingId = 1;

    // ========================= EVENTS =========================
    event BookingCreated(
        uint256 indexed bookingId,
        address indexed owner,
        address indexed tenant,
        uint256 rentAmount,
        uint256 leaseStart,
        uint256 leaseEnd
    );

    event Funded(
        uint256 indexed bookingId,
        address indexed tenant,
        uint256 totalAmount,
        uint256 platformFee,
        uint256 ownerAmount
    );

    event LeaseStarted(uint256 indexed bookingId, uint256 startDate);

    event Completed(
        uint256 indexed bookingId,
        address indexed owner,
        uint256 ownerAmount,
        uint256 platformAmount
    );

    event Cancelled(uint256 indexed bookingId, address indexed by);

    event Refunded(uint256 indexed bookingId, address indexed tenant, uint256 amount);

    event Dispute(
        uint256 indexed bookingId,
        address indexed initiator,
        string reason
    );

    event PlatformFeeUpdated(uint256 newFee);

    event BookingFeeUpdated(uint256 indexed bookingId, uint256 newFee);

    // ========================= CONSTRUCTOR =========================
    constructor() {
        platformOwner = payable(msg.sender);
    }

    // ========================= MODIFIERS =========================
    modifier onlyPlatformOwner() {
        require(msg.sender == platformOwner, "Seul le proprietaire de la plateforme");
        _;
    }

    modifier onlyBookingOwner(uint256 _bookingId) {
        require(bookings[_bookingId].exists, "Reservation inexistante");
        require(msg.sender == bookings[_bookingId].owner, "Seul le proprietaire du logement");
        _;
    }

    modifier onlyBookingTenant(uint256 _bookingId) {
        require(bookings[_bookingId].exists, "Reservation inexistante");
        require(msg.sender == bookings[_bookingId].tenant, "Seul le locataire");
        _;
    }

    modifier nonReentrant(uint256 _bookingId) {
        require(!bookings[_bookingId].locked, "Reentrancy detecte");
        bookings[_bookingId].locked = true;
        _;
        bookings[_bookingId].locked = false;
    }

    modifier bookingExists(uint256 _bookingId) {
        require(bookings[_bookingId].exists, "Reservation inexistante");
        _;
    }

    // ========================= CRÉATION DE RÉSERVATION =========================
    /**
     * @dev Crée une nouvelle réservation
     * @param _owner Adresse du propriétaire du logement
     * @param _tenant Adresse du locataire
     * @param _rentAmount Montant du loyer en Wei
     * @param _leaseStart Timestamp de début de location
     * @param _leaseEnd Timestamp de fin de location
     * @return bookingId L'ID de la réservation créée
     */
    function createBooking(
        address payable _owner,
        address payable _tenant,
        uint256 _rentAmount,
        uint256 _leaseStart,
        uint256 _leaseEnd
    ) external onlyPlatformOwner returns (uint256) {
        require(_owner != address(0), "Adresse proprietaire invalide");
        require(_tenant != address(0), "Adresse locataire invalide");
        require(_rentAmount > 0, "Montant doit etre superieur a 0");
        require(_leaseEnd > _leaseStart, "Date de fin doit etre apres la date de debut");
        require(_leaseStart >= block.timestamp, "Date de debut doit etre dans le futur");

        uint256 bookingId = nextBookingId++;

        bookings[bookingId] = Booking({
            id: bookingId,
            owner: _owner,
            tenant: _tenant,
            rentAmount: _rentAmount,
            leaseStart: _leaseStart,
            leaseEnd: _leaseEnd,
            platformFeePercent: defaultPlatformFeePercent,
            state: State.Created,
            exists: true,
            locked: false
        });

        emit BookingCreated(bookingId, _owner, _tenant, _rentAmount, _leaseStart, _leaseEnd);

        return bookingId;
    }

    /**
     * @dev Crée une réservation avec des frais personnalisés
     */
    function createBookingWithCustomFee(
        address payable _owner,
        address payable _tenant,
        uint256 _rentAmount,
        uint256 _leaseStart,
        uint256 _leaseEnd,
        uint256 _customFeePercent
    ) external onlyPlatformOwner returns (uint256) {
        require(_customFeePercent <= 100, "Frais invalides");

        uint256 bookingId = this.createBooking(_owner, _tenant, _rentAmount, _leaseStart, _leaseEnd);
        bookings[bookingId].platformFeePercent = _customFeePercent;

        emit BookingFeeUpdated(bookingId, _customFeePercent);

        return bookingId;
    }

    // ========================= PAIEMENT =========================
    /**
     * @dev Le locataire paie le loyer avec commission incluse
     * @param _bookingId ID de la réservation
     */
    function fund(uint256 _bookingId)
    external
    payable
    onlyBookingTenant(_bookingId)
    nonReentrant(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];
        require(booking.state == State.Created, "Paiement deja effectue ou non autorise");
        require(msg.value == booking.rentAmount, "Montant incorrect");

        uint256 platformFee = (msg.value * booking.platformFeePercent) / 100;
        uint256 ownerAmount = msg.value - platformFee;

        // Transfert immédiat à la plateforme
        (bool sentPlatform, ) = platformOwner.call{value: platformFee}("");
        require(sentPlatform, "Transfert commission plateforme echoue");

        // Transfert immédiat au propriétaire
        (bool sentOwner, ) = booking.owner.call{value: ownerAmount}("");
        require(sentOwner, "Transfert proprietaire echoue");

        booking.state = State.Funded;

        emit Funded(_bookingId, msg.sender, msg.value, platformFee, ownerAmount);
    }

    // ========================= DÉMARRAGE DE LOCATION =========================
    /**
     * @dev Le propriétaire démarre la location
     * @param _bookingId ID de la réservation
     */
    function startLease(uint256 _bookingId)
    external
    onlyBookingOwner(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];
        require(booking.state == State.Funded, "Le contrat doit etre finance avant de commencer");
        require(block.timestamp >= booking.leaseStart, "La date de debut n'est pas encore atteinte");

        booking.state = State.Active;

        emit LeaseStarted(_bookingId, block.timestamp);
    }

    // ========================= COMPLÉTION =========================
    /**
     * @dev Le propriétaire termine la location
     * @param _bookingId ID de la réservation
     */
    function complete(uint256 _bookingId)
    external
    onlyBookingOwner(_bookingId)
    nonReentrant(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];
        require(booking.state == State.Active, "La location doit etre active");
        require(block.timestamp >= booking.leaseEnd, "La date de fin n'est pas encore atteinte");

        booking.state = State.Completed;

        emit Completed(_bookingId, booking.owner, 0, 0);
    }

    // ========================= ANNULATION =========================
    /**
     * @dev Annule une réservation (propriétaire, locataire ou plateforme)
     * @param _bookingId ID de la réservation
     */
    function cancel(uint256 _bookingId)
    external
    bookingExists(_bookingId)
    nonReentrant(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];

        require(
            msg.sender == booking.owner ||
            msg.sender == booking.tenant ||
            msg.sender == platformOwner,
            "Pas autorise a annuler"
        );

        require(
            booking.state == State.Created || booking.state == State.Funded,
            "Annulation impossible a ce stade"
        );

        // Si déjà financé et que c'est le locataire qui annule, remboursement
        if (booking.state == State.Funded && msg.sender == booking.tenant) {
            uint256 balance = address(this).balance;
            if (balance > 0) {
                (bool sent, ) = booking.tenant.call{value: balance}("");
                require(sent, "Remboursement echoue");
                emit Refunded(_bookingId, booking.tenant, balance);
            }
        }

        booking.state = State.Cancelled;

        emit Cancelled(_bookingId, msg.sender);
    }

    // ========================= GESTION DES LITIGES =========================
    /**
     * @dev Remboursement partiel en cas de litige (uniquement propriétaire)
     * @param _bookingId ID de la réservation
     * @param _to Adresse du destinataire
     * @param _amount Montant à rembourser
     * @param _reason Raison du remboursement
     */
    function refundDispute(
        uint256 _bookingId,
        address payable _to,
        uint256 _amount,
        string memory _reason
    )
    external
    onlyBookingOwner(_bookingId)
    nonReentrant(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];
        require(booking.state == State.Active, "Litige possible seulement pendant la location");
        require(_amount <= address(this).balance, "Montant insuffisant dans le contrat");

        (bool sent, ) = _to.call{value: _amount}("");
        require(sent, "Transfert echoue");

        emit Dispute(_bookingId, msg.sender, _reason);
    }

    // ========================= GESTION DES FRAIS =========================
    /**
     * @dev Modifie les frais par défaut de la plateforme
     * @param _newFee Nouveau pourcentage (0-100)
     */
    function setDefaultPlatformFeePercent(uint256 _newFee)
    external
    onlyPlatformOwner
    {
        require(_newFee <= 100, "Pourcentage invalide");
        defaultPlatformFeePercent = _newFee;
        emit PlatformFeeUpdated(_newFee);
    }

    /**
     * @dev Modifie les frais d'une réservation spécifique (avant paiement)
     * @param _bookingId ID de la réservation
     * @param _newFee Nouveau pourcentage (0-100)
     */
    function setBookingFee(uint256 _bookingId, uint256 _newFee)
    external
    onlyPlatformOwner
    bookingExists(_bookingId)
    {
        require(_newFee <= 100, "Pourcentage invalide");
        require(bookings[_bookingId].state == State.Created, "Impossible de modifier apres paiement");

        bookings[_bookingId].platformFeePercent = _newFee;
        emit BookingFeeUpdated(_bookingId, _newFee);
    }

    // ========================= VUES (GETTERS) =========================
    /**
     * @dev Récupère les détails complets d'une réservation
     */
    function getBookingDetails(uint256 _bookingId)
    external
    view
    bookingExists(_bookingId)
    returns (
        address owner,
        address tenant,
        uint256 rentAmount,
        uint256 leaseStart,
        uint256 leaseEnd,
        uint256 platformFeePercent,
        State state
    )
    {
        Booking storage b = bookings[_bookingId];
        return (
            b.owner,
            b.tenant,
            b.rentAmount,
            b.leaseStart,
            b.leaseEnd,
            b.platformFeePercent,
            b.state
        );
    }

    /**
     * @dev Récupère l'état d'une réservation
     */
    function getBookingState(uint256 _bookingId)
    external
    view
    bookingExists(_bookingId)
    returns (State)
    {
        return bookings[_bookingId].state;
    }

    /**
     * @dev Vérifie si une réservation existe
     */
    function bookingExists(uint256 _bookingId)
    external
    view
    returns (bool)
    {
        return bookings[_bookingId].exists;
    }

    /**
     * @dev Récupère le solde total du contrat
     */
    function getContractBalance()
    external
    view
    returns (uint256)
    {
        return address(this).balance;
    }

    /**
     * @dev Récupère le nombre total de réservations créées
     */
    function getTotalBookings()
    external
    view
    returns (uint256)
    {
        return nextBookingId - 1;
    }

    /**
     * @dev Calcule les frais pour un montant donné
     */
    function calculateFees(uint256 _bookingId, uint256 _amount)
    external
    view
    bookingExists(_bookingId)
    returns (uint256 platformFee, uint256 ownerAmount)
    {
        uint256 feePercent = bookings[_bookingId].platformFeePercent;
        platformFee = (_amount * feePercent) / 100;
        ownerAmount = _amount - platformFee;
        return (platformFee, ownerAmount);
    }

    // ========================= CHANGEMENT DE PROPRIÉTAIRE PLATEFORME =========================
    /**
     * @dev Transfère la propriété de la plateforme
     * @param _newPlatformOwner Nouvelle adresse du propriétaire
     */
    function transferPlatformOwnership(address payable _newPlatformOwner)
    external
    onlyPlatformOwner
    {
        require(_newPlatformOwner != address(0), "Adresse invalide");
        platformOwner = _newPlatformOwner;
    }

    // ========================= FONCTION DE SECOURS =========================
    /**
     * @dev Permet à la plateforme de retirer les fonds bloqués (sécurité)
     */
    function emergencyWithdraw()
    external
    onlyPlatformOwner
    {
        uint256 balance = address(this).balance;
        require(balance > 0, "Pas de fonds a retirer");

        (bool sent, ) = platformOwner.call{value: balance}("");
        require(sent, "Retrait echoue");
    }

    // Fallback pour recevoir de l'ETH
    receive() external payable {}
}
