import {protocol, renderData} from './main.js'

function Modal() {
	const modalWrapper = document.querySelector('.modal-wrapper-answer')

	const cancelButton = document.querySelector('img.close')

	cancelButton.addEventListener('click', close)

   // Fechar modal pressionando o ESC
   document.addEventListener('keydown', function(event){
      if(event.key === "Escape"){
         close()
      }
   })

	function open() {
		//Funcionalidade de atribuir a classe active para a modal
		modalWrapper.classList.add('active')
	}
	function close() {
		//Funcionalidade de remover a classe active para a modal
		modalWrapper.classList.remove('active')
      renderData(protocol)
	}

	return {
		open,
		close,
	}
}

document.addEventListener('keydown', () => {
   if(e.key === 'Escape'){
      Modal().close()
   }
})

export default Modal()