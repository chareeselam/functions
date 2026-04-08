document.querySelector('#get-started').addEventListener('click', () => {
	document.querySelector('#intro').style.display = 'none'
	document.querySelector('#form-section').classList.add('active')
})

const steps = document.querySelectorAll('.step')
const nextBtn = document.querySelector('.next')
const submitBtn = document.querySelector('#submit')
let currentStep = 0
let data = []

// load data then show question one
// this is a fetch request to get the data from the .json file
// i learned that fetch returns a promise and that we can chain .then() to handle the response
// the first .then() converts the response to JSON, and the second .then() assigns the JSON data to our variable and shows the first step of the form
fetch('data.json')
	.then(response => response.json())
    // https://developer.mozilla.org/en-US/docs/Web/API/Response/json
	.then(json => {
		data = json
		showStep(0)
	})

// next button only if users input is valid
function isAnswered(step) {
    const radio = step.querySelector('input[type="radio"]')
    if (radio) return !!step.querySelector('input[type="radio"]:checked')
    const dropdown = step.querySelector('select')
    if (dropdown) return dropdown.value !== ''
    // this means that if there are radios or dropdowns in the step, we check if they have a value before allowing users to click "next". If there aren't any radios or dropdowns, we just return true and allow users to click "next" without having to answer any questions (like for the energy level slider).
    // i only need it for radios and dropdowns because for other questions like my energyLevel slider, it starts at "1" but if users are already feeling "1", they don't have to move it and just click "next"
    return true
}

// show/hide/disabled next/submit buttons
function showStep(index) {
    steps.forEach((step, i) => {
        step.classList.toggle('active', i === index)

    })
    
    const isLast = index === steps.length - 1
        nextBtn.hidden = isLast
        submitBtn.hidden = !isLast

        nextBtn.disabled = !isAnswered(steps[index])
        submitBtn.disabled = !isAnswered(steps[index])
}

// update next/submit button state when user makes a selection
document.querySelector('#nightcap-form').addEventListener('change', () => {
    showStep(currentStep)
})

// next question
nextBtn.addEventListener('click', () => {
	if (!isAnswered(steps[currentStep])) return
	steps[currentStep].classList.add('answered')
	currentStep++
	showStep(currentStep)
})

// reset button
document.querySelector('#nightcap-form').addEventListener('reset', () => {
	currentStep = 0
	steps.forEach(step => step.classList.remove('answered'))
	document.querySelector('#result').innerHTML = ''
	showStep(0)
})

// submit button
// document.querySelector('#nightcap-form').addEventListener('submit', (event) => {

// filter data and show result

// after speaking to my professor Michael about and Eric, i rewrote the logic of how the form filters through data. Explained my logic below.
// main issue after: The "submit" button wasn't working after i rewrote it and i spoke with Claude to understand why and the mistakes i made were: forgetting to define criteria [x], starting an array at 1 instead of 0, mismatch naming between form and data, and not including the "type of activity" criteria in the filtering logic.
// https://claude.ai/share/fb79f9e3-bb71-4878-b95a-296a0b03281c
submitBtn.addEventListener('click', (event) => {
    event.preventDefault()

    const inOrOut = document.querySelector('[name="in-or-out"]:checked')
    let energyLevel = parseInt(document.querySelector('#energy').value)
    // i wanted users to fill out the form and give them more flexibility when answering the energy level question so i decided to represent it of 1-5 so they can pick in-between values. i had to parse it as an integer because the value from the dropdown is a string and i needed to compare it to numbers.
    // i also learned to change const to let for energyLevel because i needed to reassign the value after mapping it to low/medium/high.
    const soloOrSocial = document.querySelector('[name="solo-or-social"]:checked')
    const costSelection = document.querySelector('[name="cost"]:checked')
    const activityType = document.querySelector('#activity-dropdown').value;

    // map energy level 1-5
    // the values for energyLevel in .json is low/medium/high, but in the form, i wanted to give users the options to pick in-betweens (#2 or #4) so here, i'm defining what those values correspond to in the .json data. 
    let energyValue = energyLevel
        if (energyLevel <= 2) energyLevel = 'low'
        else if (energyLevel <= 3) energyLevel = 'medium'
        else energyLevel = 'high'

    const results = data.filter(item => {
        const criteria = item.criteria;
        // i am mapping through each item in the data and checking if it matches the user's selections. if any of the criteria don't match, i return false and that item is filtered out. If all criteria match, I return true and that item is included in the results.

        const inOut = criteria[0]["in/out"];
        if (inOrOut && !inOut[inOrOut.value]) return false;

        const energy = criteria[1]["energy"];
        if (energyLevel && !energy[energyLevel]) return false;

        const cost = criteria[2]["cost"];
        if (costSelection && !cost[costSelection.value]) return false;

        const soloSocial = criteria[3]["solo/social"];
        if (soloOrSocial && !soloSocial[soloOrSocial.value]) return false;

        const activityOptions = criteria[4]["type of activity"];
        if (activityType && !activityOptions.includes(activityType)) return false;

        return true;
    });

    const resultDiv = document.querySelector('#result')
        if (results.length === 0) {
            resultDiv.innerHTML = '<p>No activities found. Try something else :)</p>'
        } else {
            resultDiv.innerHTML = results.map(item => 
                `
                    <img src="${item.image}" alt="${item.name}">
                    <p>${item.name}</p>
                `
                ).join('')
        }
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