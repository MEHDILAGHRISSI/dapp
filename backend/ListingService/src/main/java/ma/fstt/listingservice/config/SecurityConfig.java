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
                // ✅ Nouvelle syntaxe lambda pour CSRF
                .csrf(csrf -> csrf.disable())  // Désactivé car API REST

                // ✅ Nouvelle syntaxe lambda pour les autorisations
                .authorizeHttpRequests(auth -> auth
                        // Endpoints publics (lecture seule)
                        .requestMatchers("/properties/*/public").permitAll()
                        .requestMatchers("/properties/search").permitAll()

                        // Tous les autres requièrent authentification
                        .anyRequest().authenticated()
                )

                // ✅ Nouvelle syntaxe lambda pour HTTP Basic
                .httpBasic(basic -> {})  // Basic auth pour service-to-service

                // ✅ Session stateless pour API REST
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        return http.build();
    }
}