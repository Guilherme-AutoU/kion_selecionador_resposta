export function horizontalScroll() {
	const container = document.querySelector('.questions')
	const divQuestionArea = document.querySelector('.question_area')

	if (container.scrollWidth > window.innerWidth - convertRemToPixels(2)) {
		const imgRight = document.createElement('img')
		imgRight.classList.add('horizontal__scroll__right')
		imgRight.setAttribute('src', 'images/chevron_right.svg')
		imgRight.setAttribute('alt', 'Ver mais questões')

      const imgLeft = document.createElement('img')
		imgLeft.classList.add('horizontal__scroll__left')
		imgLeft.setAttribute('src', 'images/chevron_right.svg')
		imgLeft.setAttribute('alt', 'Ver mais questões')

		divQuestionArea.appendChild(imgRight)
		divQuestionArea.appendChild(imgLeft)

      scroll(container)
	}

}

function convertRemToPixels(rem) {
	return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
}

function scroll(container){
   const buttonRight = document.querySelector('.horizontal__scroll__right')
   const pageWidth = container.getBoundingClientRect().width
   
   buttonRight.addEventListener('click', () => {
      container.scrollBy((pageWidth / 2) + 20, 0)
   })

   const buttonLeft = document.querySelector('.horizontal__scroll__left')
   
   buttonLeft.addEventListener('click', () => {
      container.scrollBy(20 - (pageWidth / 2), 0)
   })
}
