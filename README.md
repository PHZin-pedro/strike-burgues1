# Strike Burgue's — V5 geral

Sistema de atendente, estoque, vendas e impressão térmica pensado para uso pelo celular.

## Render

O projeto continua sendo Node + Express e pode ser publicado como Web Service no Render. O Render executa o `server.js`, salva os dados no `data/db.json` e serve o site.

**Importante sobre impressão:** um servidor no Render não consegue, por regra geral, abrir uma conexão TCP diretamente para uma impressora que está na rede Wi‑Fi privada da lanchonete. Para impressão Wi‑Fi/Bluetooth sem PC, esta V5 possui três caminhos:

1. **App Android (`android-bridge/`) — recomendado:** o celular abre o mesmo sistema e a ponte Android envia ESC/POS por Wi‑Fi/IP ou Bluetooth Classic.
2. **Bluetooth BLE pelo Chrome Android:** escolha `Bluetooth BLE` nas configurações e use o botão de teste. A compatibilidade depende da impressora e do serviço BLE que ela expõe.
3. **Wi‑Fi direto pelo servidor:** só funciona se o servidor tiver rota de rede até a impressora (normalmente não é o caso no Render).

## Configuração da impressora

No sistema, em Configurações, há:
- Wi‑Fi / rede (IP)
- Bluetooth
- Bluetooth BLE
- Navegador / teste
- IP, porta 9100 e nome Bluetooth opcional

## Android bridge

A pasta `android-bridge/` contém uma base de aplicativo Android sem PC. Ele carrega a URL do Render em WebView e expõe `window.StrikePrinter.printEscPos(...)` para o site. O código nativo envia os bytes ESC/POS por TCP (Wi‑Fi) ou Bluetooth Classic (SPP).

Para compilar é necessário Android Studio/SDK e JDK. Edite a URL em `MainActivity.java` antes de gerar o APK.

## Limitação honesta

Não existe um protocolo universal que faça qualquer impressora térmica Bluetooth/Wi‑Fi funcionar no navegador. Modelos diferentes podem usar BLE, Bluetooth Classic/SPP, TCP 9100, protocolos de fabricante ou outros serviços. Por isso o sistema é genérico e oferece tentativas diferentes; se uma impressora específica não responder, o modelo/protocolo dela precisa ser ajustado.
