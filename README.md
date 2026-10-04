# Strike Burgue's — V8 corrigido

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


## Correção V7: cardápio inicial
O servidor agora inicializa automaticamente o banco com o cardápio Strike Burgue’s e o estoque inicial quando o banco ainda não existe ou foi criado vazio. O arquivo `data/seed.json` é o modelo inicial; dados já cadastrados não são sobrescritos.


## Correções V8
- Corrigido o erro JavaScript que interrompia o carregamento dos botões: o código tentava registrar eventos em `#importFile`, elemento que não existia.
- O botão de backup e o de restauração agora estão ligados a elementos existentes.
- Erros HTTP (como estoque insuficiente) não desligam mais a API e não mandam o sistema silenciosamente para o modo local.
- Adicionados foco visível e áreas de toque maiores no celular.
- O CSS foi limpo de texto de documentação que havia sido anexado por engano.

## Observação sobre dados no Render Free
O arquivo `data/db.json` pode ser apagado pelo ambiente efêmero do plano gratuito durante reinicializações/deploys. Não use o modo local como cópia principal dos dados. Para persistência confiável, configure um banco PostgreSQL e conecte-o à aplicação ou use armazenamento persistente compatível.
