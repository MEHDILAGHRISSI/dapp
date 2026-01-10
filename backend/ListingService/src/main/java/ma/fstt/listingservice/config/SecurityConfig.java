package ma.fstt.listingservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // ✅ Désactiver CSRF pour API REST
                .csrf(csrf -> csrf.disable())

                // ✅ Configuration des autorisations
                .authorizeHttpRequests(auth -> auth
                        // ========== ROUTES PUBLIQUES (Pas d'authentification) ==========

                        // Properties - Lecture publique
                        .requestMatchers("/properties").permitAll()                    // GET all properties
                        .requestMatchers("/properties/{id}").permitAll()               // GET property by ID
                        .requestMatchers("/properties/{id}/public").permitAll()        // GET public details
                        .requestMatchers("/properties/search").permitAll()             // Search properties
                        .requestMatchers("/properties/nearby").permitAll()             // Nearby properties
                        .requestMatchers("/properties/owner/{ownerId}/active-count").permitAll() // Active count

                        // Characteristics - Lecture publique
                        .requestMatchers("/characteristics").permitAll()               // GET all characteristics
                        .requestMatchers("/characteristics/{id}").permitAll()          // GET characteristic by ID

                        // Type Caracteristiques - Lecture publique
                        .requestMatchers("/type-caracteristiques").permitAll()         // GET all types
                        .requestMatchers("/type-caracteristiques/{id}").permitAll()    // GET type by ID

                        // Owners - Vérification publique
                        .requestMatchers("/owners/check/{userId}").permitAll()         // Check owner status

                        // ========== ROUTES PROTÉGÉES (Authentification JWT requise) ==========
                        // Toutes les autres routes nécessitent authentification
                        .anyRequest().authenticated()
                )

                // ✅ Désactiver HTTP Basic (pas besoin pour service-to-service via Gateway)
                .httpBasic(basic -> basic.disable())

                // ✅ Session stateless pour API REST
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        return http.build();
    }
}