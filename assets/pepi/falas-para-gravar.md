# Falas para gravar

Falas que já estão no código e ainda não têm áudio. Até serem gravadas, aparecem só
como legenda no balão do Pepi. Depois de gravar, salve cada arquivo com o nome da
primeira coluna nesta pasta e registre o `id` em [falas.json](falas.json).

Grave cada fala exatamente como está escrita: a legenda é mostrada palavra por palavra.

## Opcionais (ficam só como legenda)

As falas do final já foram gravadas. As abaixo são opcionais: sem áudio, aparecem só
como legenda no balão.

## Tela em Obras (o Pepi fala dentro do jogo, de capacete)

| Arquivo | id | Fala | Quando toca |
| --- | --- | --- | --- |
| `75-obra-inbox.mp3` | `obraInbox` | Primeira obra: uma caixa de entrada sem nenhuma mensagem. Mostra pra pessoa que está tudo bem! | Começo da obra 1. |
| `76-obra-cart.mp3` | `obraCart` | Agora, um carrinho vazio. Dá um motivo pra pessoa voltar às compras! | Começo da obra 2. |
| `77-obra-search.mp3` | `obraSearch` | Última obra: uma busca que não achou nada. Ajuda a pessoa a tentar de novo! | Começo da obra 3. |
| `78-obra-time.mp3` | `obraTime` | Acabou o tempo! Vamos vistoriar o que deu pra montar. | Quando o tempo de uma obra acaba. |
| `79-obra-good.mp3` | `obraGood` | Obra aprovada! Crachás certinhos e um vazio que acolhe. Carimbado! | Vistoria com 80% ou mais. |
| `80-obra-fix.mp3` | `obraFix` | Hmm, a vistoria achou uns problemas. Olha os alfinetes vermelhos na tela! | Vistoria abaixo de 80%. |
| `81-obra-done.mp3` | `obraDone` | Fim do expediente na obra! Lembra: quem usa leitor de tela também precisa entender o vazio. | No resultado final, com média de 70% ou mais. |
| `82-obra-retry.mp3` | `obraRetry` | Quase! Pra concluir, a média da vistoria precisa chegar a setenta por cento. Bora reformar? | No resultado final, com média abaixo de 70%. |

## Labirinto do Tab (o Pepi fala dentro do jogo, de explorador)

| Arquivo | id | Fala | Quando toca |
| --- | --- | --- | --- |
| `86-maze-good.mp3` | `mazeGood` | Saída encontrada, quase sem passos perdidos. Que faro! | Fim de um nível com 80% de eficiência ou mais. |
| `87-maze-slow.mp3` | `mazeSlow` | Achou a saída! Mas deu umas voltinhas. Será que tem um caminho mais curto? | Fim de um nível abaixo de 80%. |
| `88-maze-ghost.mp3` | `mazeGhost` | Ué, cadê o foco? Ele entrou num elemento invisível. Isso deixa muita gente perdida! | Na primeira vez que o foco cai num link invisível. |
| `89-maze-trap.mp3` | `mazeTrap` | Uma janela prendeu o foco! Procure um botão pra fechar. | Na primeira vez que uma janela abre sozinha e prende o foco. |
| `90-maze-mouse.mp3` | `mazeMouse` | Opa, aqui o mouse não funciona! Use o teclado, ou as teclas aqui embaixo. | Na primeira vez que alguém clica no labirinto. |
| `91-maze-done.mp3` | `mazeDone` | Você saiu do labirinto! Lembra: tem gente que navega só pelo teclado, todo santo dia. | No resultado final, com média de 70% ou mais. |
| `92-maze-retry.mp3` | `mazeRetry` | Quase! Pra concluir, a eficiência média precisa chegar a setenta por cento. Bora mais uma volta? | No resultado final, com média abaixo de 70%. |

## A Casa Assombrada do Dark UX (o Pepi de caça-fantasmas, com lanterna)

| Arquivo | id | Fala | Quando toca |
| --- | --- | --- | --- |
| `94-house-room.mp3` | `houseRoom` | Mais um cômodo. Passa a lanterna devagar e procura o que está assombrado. | Ao entrar num cômodo. |
| `95-house-found.mp3` | `houseFound` | Achou uma assombração! Agora escolhe o conserto certo. | Na primeira assombração encontrada. |
| `96-house-scared.mp3` | `houseScared` | Aaai! Que susto. Cuidado, que a coragem está acabando! | Quando sobram 2 corações (uma vez por partida). |
| `97-house-cleared.mp3` | `houseCleared` | Cômodo limpo! As luzes voltaram. | Ao limpar um cômodo. |
| `98-house-fled.mp3` | `houseFled` | A coragem acabou… Respira fundo e tenta esse cômodo de novo. | Sem coragem, num cômodo ou contra o fantasma. |
| `100-house-boss-hit.mp3` | `houseBossHit` | Acertou em cheio! Ele sentiu essa. | No primeiro golpe certo no fantasma. |
| `102-house-retry.mp3` | `houseRetry` | Ele caiu, mas a casa ainda não está limpa. Pra vencer, a média precisa chegar a setenta por cento. | Fantasma derrotado com média abaixo de 70%. |

## Só legenda (não precisam de áudio)

Frases curtas do garçom enquanto ele corre até a mesa: "Saindo!", "Prontinho!",
"Bom apetite!", "Ligeirinho!", "Tá na mão!" e "Já vai!". Quando uma mesa desiste de
esperar: "Ih, a mesa 2 cansou de esperar!", "A mesa 2 desistiu…" e "Demorou! A mesa 2
foi embora." (o número muda conforme a mesa).
