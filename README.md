# Strike Burgue's — V6 simples

Sistema de pedidos, estoque e histórico para usar pelo celular.

## Publicar no Render
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: deixe vazio.

## Impressão
Ao finalizar cada pedido, o sistema abre a tela de impressão do navegador. Selecione a impressora térmica que estiver configurada no Android/celular. O tamanho das letras foi aumentado. A impressão pelo navegador depende de o celular reconhecer a impressora; não envia ESC/POS diretamente por si só.

## Estoque
A quantidade aparece em um campo editável em cada item. Digite a quantidade que existe agora e toque em **Salvar**. Também há botões + e − e entrada adicional.

## Cardápio
Os produtos usam pão e hambúrguer comuns; os itens artesanais foram removidos do cardápio e do estoque.

## Armazenamento — atenção no Render Free
Esta versão mantém a API e grava em `data/db.json` com gravação temporária e renomeação. Porém, o sistema de arquivos do serviço gratuito do Render é efêmero: os dados podem ser perdidos quando o serviço reinicia ou é implantado. Para armazenamento realmente persistente, configure um PostgreSQL e conecte a aplicação a ele, ou use um disco persistente pago. Faça exportação de backup regularmente.
