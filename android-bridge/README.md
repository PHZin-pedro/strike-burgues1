# Ponte Android — Strike Burgue's

Esta pasta é opcional e existe para o caso de o Chrome não conseguir falar diretamente com a impressora.

1. Instale Android Studio + JDK.
2. Abra esta pasta como projeto.
3. Em `app/src/main/java/.../MainActivity.java`, troque `APP_URL` pelo endereço do seu serviço no Render.
4. Gere o APK e instale no celular Android.
5. Pareie a impressora Bluetooth no Android, ou coloque a impressora Wi‑Fi na mesma rede do celular.
6. No sistema, abra Configurações e escolha `Wi‑Fi / rede (IP)` ou `Bluetooth`.
7. Para Wi‑Fi, coloque IP e porta 9100 (ou a porta do modelo). Para Bluetooth, coloque o nome exatamente como aparece no Android.

A ponte entende ESC/POS genérico. Não existe garantia de compatibilidade com todo modelo; impressoras com protocolos proprietários podem exigir adaptação.
