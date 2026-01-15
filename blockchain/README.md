### 9.2 Machine à états: Property

```mermaid
stateDiagram-v2
    [*] --> DRAFT: createProperty()
    
    DRAFT --> PENDING: submit()
    
    PENDING --> APPROVED: approve() [ADMIN]
    
    PENDING --> REJECTED: reject() [ADMIN]
    
    REJECTED --> DRAFT: edit()
    
    DRAFT --> DRAFT: edit()
    
    APPROVED --> [*]: Property visible<br/>in public search
```

**Transitions:**
- **DRAFT → PENDING:** Lorsque l'hôte clique sur "Soumettre pour approbation"
- **PENDING → APPROVED:** Lorsque l'admin approuve la propriété
- **PENDING → REJECTED:** Lorsque l'admin rejette la propriété
- **REJECTED → DRAFT:** Lorsque l'hôte réédite la propriété rejetée
