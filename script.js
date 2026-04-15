// const steps = document.querySelectorAll('.step')
// let currentStep = 0
 
// function showStep(index) {
// 	steps.forEach((step, i) => {
// 		step.classList.toggle('active', i === index)
// 	})
// }
 
// showStep(0)
 
// steps.forEach((step, index) => {
// 	const inputs = step.querySelectorAll('input, select')
 
// 	inputs.forEach(input => {
// 		input.addEventListener('change', () => {
// 			if (input.value) {
// 				// Mark this step as answered, then advance.
// 				step.classList.add('answered')
// 				currentStep = index + 1
// 				showStep(currentStep)
// 			}
// 		})
// 	})
// })