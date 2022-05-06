import Modal from './modal.js'

import { horizontalScroll } from './horizontalScroll.js'

var currentQuestion = 1

const divQuestions = document.querySelector('.questions')
const select = document.getElementById('protocol')
let protocol = 'Protocolo 1'
select.addEventListener('change', () => {
   protocol = select.options[select.selectedIndex].text
   renderData(protocol)
})

renderData(protocol)

async function renderData(protocol){
   const question = await fetch(window.location.href + 'question')
   .then(response => response.json())

   const alternative = await fetch(window.location.href + 'alternative')
   .then(response => response.json())

   const protocolId = await fetch(window.location.href + 'protocolid')
   .then(response => response.json())
   
   await questionForEach(question, alternative, protocol)
}

async function questionForEach(question, alternative, protocol){
   let questionsForThisProtocol = []
   let questionsRender = []
   // ADICIONANDO AS PERGUNTAS DINÂMICAMENTE E NOS SEUS LUGARES CORRETOS
   divQuestions.innerHTML = ''
   question.forEach((item) => {
      if (`Protocolo ${item.Protocolo}` == protocol && item.Ordem <= 2) {
         const divQuestion = document.createElement('div')
         divQuestion.classList.add('question')

         const h2Question = document.createElement('h2')
         h2Question.classList.add('question__number')
         h2Question.textContent = `Pergunta ${item.Ordem}`

         const h2 = document.createElement('h2')
         h2.classList.add('question__text')
         h2.textContent = `${item.Pergunta}`
         
         const title = document.createElement('div')
         title.classList.add('question__title')
         title.appendChild(h2Question)
         title.appendChild(h2)

         const divOptions = document.createElement('div')
         divOptions.classList.add('question__options', `question_${item.Ordem}`)

         alternative.forEach((alternative) => {
            if (alternative.IdDaPergunta == item.ID) {
               const input = document.createElement('input')
               input.setAttribute('type', 'button')
               input.setAttribute('value', `${alternative.Alternativa}`)
               input.setAttribute('id', `${alternative.ID}`)
               if(currentQuestion !== verifyQuestionOrder(alternative, question)){
                  input.setAttribute('disabled', 'true')
               }

               divOptions.appendChild(input)
            }
         })
         divQuestion.appendChild(title)
         divQuestion.appendChild(divOptions)
         divQuestions.appendChild(divQuestion)
         questionsRender.push(item)
      }
      if(`Protocolo ${item.Protocolo}` == protocol){
         questionsForThisProtocol.push(item)
      }
   })

   // LÓGICA PARA SELECIONAR AS PERGUNTAS
   const questionOptions = document.querySelectorAll('.question__options')

   questionOptions.forEach((question) => {
      const inputs = document.querySelectorAll(`.${question.classList[1]} input`)
      inputs.forEach((input) => {
         input.addEventListener('click', () => {
            addActive(input, inputs, protocol, questionsForThisProtocol, questionsRender)
            setCurrentQuestion(question, alternative)
         })
      })
   })

   horizontalScroll()
}

// VERIFICAR ORDEM DA PERGUNTA
function verifyQuestionOrder(alternative, question){
   let order
   question.forEach((item) => {
      if(alternative.IdDaPergunta == item.ID){
         order =  item.Ordem
      }
   })

   return order
}

// ADICIONAR ACTIVE AO ELEMENTOS ESCOLHIDOS
async function addActive(element, array, protocol, questionsForThisProtocol, questionsRender) {
   if(element.classList[0] !== 'disabled'){
      array.forEach((item) => {
         if (item.classList[0] == 'active') {
            // Lógica para quando questões anteriores forem alteradas
            changeBeforeQuestion(item)  
            item.classList.remove('active')
         }
      })
      element.classList.add('active')
   }

   const wayToAnswer = await fetch(window.location.href + 'waytoanswer')
   .then(response => response.json())
   verifyWay(wayToAnswer, protocol, questionsForThisProtocol, questionsRender)
}

// REMOVER DISABLED A MEDIDA QUE AVANÇA NAS PERGUNTAS
function setCurrentQuestion(question, alternative) {  
   const questionOptionsNow = document.querySelector(`.question_${currentQuestion} .active`)

   // Aumentar de questão apenas quando a questão atual for selecionada
   if(questionOptionsNow !== null && verifyNextQuestion(currentQuestion)) {
      currentQuestion = Number(question.classList[1].split('_')[1]) + 1
   }
   
   const questionOptions = document.querySelectorAll('.question__options')
   questionOptions.forEach((question) => {
      if(question.classList[1] === `question_${currentQuestion}`){
         question.childNodes.forEach((children) => {
            if(verifyLastQuestion(questionOptionsNow, children, alternative) == true){
               children.removeAttribute('disabled')
            } else {
               children.setAttribute('disabled', 'true')
            }
         })
      } 
   })

}

// LIBERAR APENAS AS PERMITIDAS USAR
function verifyLastQuestion(optionChoosed, children, alternative){
   var childrenUsed
   alternative.forEach((item) => {
      if(item.ID == children.id){
         childrenUsed = item
      }
   })
   var verify = false
   childrenUsed.IDsAnteriores.forEach((lastIDs) => {
      if(lastIDs === optionChoosed.id){
         verify = true
      }
   })
   return verify
}


function verifyNextQuestion(questionNow){
   const questionOptionsNow = document.querySelectorAll(`.question_${questionNow} input`)
   let returnFunction = false
   questionOptionsNow.forEach((item) => {
      if(item.classList[0] == 'active'){
         returnFunction = true
      }
   })

   return returnFunction
}

// CASO UMA ALTERNATIVA ANTERIOR SEJA ALTERADA O FORM É LIMPADO
function changeBeforeQuestion(element){
   const questionChanged = element.parentNode.classList[1].split('_')[1]
   currentQuestion = questionChanged
   clearForm(questionChanged)
}

// LIMPAR O FORM QUANDO FOR TROCADA A OPÇÃO DA PERGUNTA ANTERIOR
function clearForm(currentQuestion){
   const question = document.querySelectorAll('.question__options')

   question.forEach((item) => {
      if(item.classList[1].split('_')[1] > currentQuestion){
         item.childNodes.forEach((children) => {
            children.classList.remove('active')
            children.setAttribute('disabled', 'true')
         })
      }
   })
}

// VERIFICAR CAMINHO DA RESPOSTA
async function verifyWay(wayToAnswer, protocol, questionsForThisProtocol, questionsRender) {
   const elementsChoosed = document.querySelectorAll('.active')
   let optionsChoosed = []

   let numberOfAnswer = 0
   // Mudar lógica para perguntar que necessitem mais de 3 questões
   if(elementsChoosed.length >= questionsRender.length){
      for(let i = 0; i < 8; i++){
         if(elementsChoosed[i]){
            optionsChoosed.push(elementsChoosed[i].id)
            numberOfAnswer++
         } else {
            optionsChoosed.push('')
         }
      }

      verifyAnswer(wayToAnswer, protocol, optionsChoosed, numberOfAnswer, questionsForThisProtocol)
   }
}

function verifyAnswer(wayToAnswer, protocol, optionsChoosed, numberOfAnswer, questionsForThisProtocol) {
   let idFromAnswer = []

   wayToAnswer.forEach((item) => {
      let isCorrect = true
      let correctAnswer = 0
      for(let i = 0; i < 8; i++){
         if(optionsChoosed[i] !== '' && optionsChoosed[i] == item.Caminho[i] && `Protocolo ${item.Protocolo}` == protocol){
            correctAnswer++
         }

         if(optionsChoosed[i] != item.Caminho[i] && optionsChoosed[i] == '' && item.Caminho[i] != null){
            isCorrect = false
         }
      }

      if(correctAnswer == numberOfAnswer && isCorrect){
         idFromAnswer.push(item.IDdaResposta)
      }
   })

   if(idFromAnswer.length !== 0){
      renderAnswer(idFromAnswer, questionsForThisProtocol)
   } else {
      renderErrorInAnswer('Nenhuma resposta encontrada')
   }
   
}

async function renderAnswer(idFromAnswer, questionsForThisProtocol){
   const answers = await fetch(window.location.href + 'answerlist')
   .then(response => response.json())

   let answerFound = []
   answers.forEach((item) => {
      idFromAnswer.forEach((idAnswer) =>{
         if(item.ID === idAnswer){
            answerFound.push(item)
         }
      })
   })

   let haveMoreQuestions = false
   if(document.querySelector('.questions').childNodes.length < questionsForThisProtocol.length){
      haveMoreQuestions = true
   }

   renderAnswerOneByOne(answerFound, answerFound[0], answerFound.length, 0,  answerFound.length - 0, haveMoreQuestions)
}

function renderAnswerOneByOne(allAnswer, answerFound, answers, number, last, haveMoreQuestions){
   const modalAnswer = document.querySelector('.answer__content')
   modalAnswer.innerHTML = ''

   const h1 = document.createElement('h1')
   const h1Txt = document.createTextNode(`${answerFound.Resposta}`)
   h1.appendChild(h1Txt)

   const h2 = document.createElement('h2')
   const h2Txt = document.createTextNode('Descrição')
   h2.appendChild(h2Txt)

   const pDesc = document.createElement('p')
   const pDescTxt = document.createTextNode(`${answerFound.Descricao}`)
   pDesc.appendChild(pDescTxt)

   const img = document.createElement('img')
   img.setAttribute('src', 'https://picsum.photos/600')
   img.setAttribute('alt', 'Foto do resultado')
   img.classList.add("result__photo")

   const divAnswerLinks = document.createElement('div')
   divAnswerLinks.classList.add('answer__links')

   const linkVideo = document.createElement('a')
   const linkVideoTxt = document.createTextNode('Vídeo')
   linkVideo.appendChild(linkVideoTxt)
   linkVideo.setAttribute('href', `${answerFound.Video.Url}`)
   linkVideo.setAttribute('target', '_blank')

   const linkDocuments = document.createElement('a')
   const linkDocsTxt = document.createTextNode('Documentos')
   linkDocuments.appendChild(linkDocsTxt)
   linkDocuments.setAttribute('href', `${answerFound.Video.Url}`)
   linkDocuments.setAttribute('target', '_blank')

   divAnswerLinks.appendChild(linkVideo)
   divAnswerLinks.appendChild(linkDocuments)

   modalAnswer.appendChild(h1)
   modalAnswer.appendChild(h2)
   modalAnswer.appendChild(pDesc)
   modalAnswer.appendChild(img)
   modalAnswer.appendChild(divAnswerLinks)

   if(last > 1){
      const buttonRight = document.createElement('img')
      buttonRight.setAttribute('src', 'images/chevron_right.svg')
      buttonRight.classList.add('change__answer__right')

      modalAnswer.appendChild(buttonRight)

      buttonRight.addEventListener('click', () => {
         renderAnswerOneByOne(allAnswer, allAnswer[number + 1], allAnswer.length, number + 1, allAnswer.length - (number + 1))
      })
   }

   if(last <= 1 && answers != 1){
      const buttonLeft = document.createElement('img')
      buttonLeft.setAttribute('src', 'images/chevron_right.svg')
      buttonLeft.classList.add('change__answer__left')

      modalAnswer.appendChild(buttonLeft)

      buttonLeft.addEventListener('click', () => {
         renderAnswerOneByOne(allAnswer, allAnswer[number - 1], allAnswer.length, number - 1, allAnswer.length - (number - 1))
      })
   }

   if(haveMoreQuestions){
      const continueButton = document.createElement('button')
      continueButton.classList.add('continue__btn')
      const btnTxt = document.createTextNode('Continuar pesquisa')
      continueButton.appendChild(btnTxt)

      continueButton.addEventListener('click', () => {
         renderNextQuestion()
      })

      modalAnswer.appendChild(continueButton)

   }

   Modal.open()

   currentQuestion = 1
}

function renderErrorInAnswer(text){
   const modalAnswer = document.querySelector('.answer__content')
   modalAnswer.innerHTML = ''

   const p = document.createElement('p')
   const pTxt = document.createTextNode(text)
   p.appendChild(pTxt)
   p.classList.add('error')

   modalAnswer.appendChild(p)

   Modal.open()
}

export {protocol, renderData}