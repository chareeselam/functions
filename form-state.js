const steps = document.querySelectorAll('.step')
const nextBtn = document.querySelector('#next')
const submitBtn = document.querySelector('#submit')
let currentStep = 0
let data = []
 
fetch('data.json')
	.then(response => response.json())
	.then(json => {
		data = json
		showStep(0)
	})
 
function showStep(index) {
	steps.forEach((step, i) => {
		step.classList.toggle('active', i === index)
	})

    const isLast = index === steps.length - 1
	nextBtn.hidden = isLast
	submitBtn.hidden = !isLast
}

nextBtn.addEventListener('click', () => {
	const currentStepEl = steps[currentStep]
	const radios = [...currentStepEl.querySelectorAll('input[type="radio"]')]
 
	if (radios.length > 0 && !radios.some(r => r.checked)) return
 
	currentStepEl.classList.add('answered')
	currentStep++
	showStep(currentStep)
})

document.querySelector('#nightcap-form').addEventListener('reset', () => {
	currentStep = 0
	steps.forEach(step => step.classList.remove('answered'))
	document.querySelector('#result').innerHTML = ''
	showStep(0)
})

// // Target your form.
// let formElement = document.querySelector('#nightcap-form')

// // Function to match the form to URL/stored params.
// let updateForm = (params) => {
// 	// Parse into params:
// 	// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
// 	params = new URLSearchParams(params)

// 	// Our friend, the `forEach` loop:
// 	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
// 	params.forEach((value, key) => {
// 		// Find them by their ID.
// 		let inputOrSelect = document.getElementById(key)

// 		if (inputOrSelect) {
// 			// Set the actual input to the param value.
// 			inputOrSelect.value = value
// 		} else {
// 			// Radios are a bit different, find them by `name` attribute.
// 			document.querySelectorAll(`[name=${key}]`).forEach((element) => {
// 				if (value == element.value) { // Check the one matching the param value.
// 					element.checked = true
// 				}
// 			}
// 		)
// 		}
// 	})

// 	// And a callback! This function is defined over in `main.js`, for clarity.
// 	stateCallback?.()
// 	// The `?.` is optional chaining:
// 	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
// }

// // Function to save them to `localStorage`.
// let storeParams = () => {
// 	// Get the form data:
// 	// https://developer.mozilla.org/en-US/docs/Web/API/FormData
// 	let formParams = new FormData(formElement)

// 	// Loop through each key/value pair.
// 	formParams.forEach((value, key) => {
// 		// And save them out to the browser:
// 		// https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
// 		localStorage.setItem(key, value)
// 	})
// }

// // Function to update the URL from the form.
// let updateUrlParams = () => {
// 	let formParams = new FormData(formElement) // Get the form data.

// 	formParams = new URLSearchParams(formParams) // Make it into params.
// 	formParams = formParams.toString() // And then into a string.

// 	// You could also write this as:
// 	// let formParams = new URLSearchParams(new FormData(formElement)).toString()

// 	// Update the URL with the params at the end.
// 	history.replaceState(null, null, '?' + formParams)
// 	// We use `history` here (instead of `location`) to not get into an infinite loop!
// 	// https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState

// 	// And also store them!
// 	storeParams()

// 	// And a callback!
// 	stateCallback?.()
// }



// // First, check for query/params in the URL:
// // https://developer.mozilla.org/en-US/docs/Web/API/Location/search
// if (location.search) {
// 	let urlParams = location.search // Get the query string.

// 	updateForm(urlParams) // Update the form from these.
// }
// // Otherwise check for saved params in storage.
// else if (localStorage.length > 0) {
// 	let storedParams = Object.entries(localStorage) // Get the saved params.

// 	updateForm(storedParams) // Update the form from these.
// }


// // Watch for events!
// formElement.addEventListener('submit', (event) => {
// 	// Don’t actually submit (which would refresh the page):
// 	// https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
// 	event.preventDefault()
// })

// // Run any time the form is modified:
// // https://developer.mozilla.org/en-US/docs/Web/API/Element/input_event
// formElement.addEventListener('input', () => {
// 	updateUrlParams()
// })