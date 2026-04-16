// if the browser restores the page from bfcache (e.g. hitting the browser back button),
// reload so form inputs don't carry over from a previous session
window.addEventListener('pageshow', (e) => {
	if (e.persisted) location.reload()
})

document.querySelector('#start').addEventListener('click', () => {
	document.querySelector('#home').classList.remove('active')
	document.querySelector('#form-section').classList.add('active')
	document.querySelector('#progress-bar').classList.add('active')
})

const steps = document.querySelectorAll('.step')
const submitBtn = document.querySelector('#submit')
let currentStep = 0
let maxStep = 0
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
		document.querySelector('#nightcap-form').reset()
		showStep(0)
		updateProgressBar(0)
	})

// back button
// the back button just moves back a step and updates the progress bar. if users are on the first step and click back, it takes them to the landing page and resets the form state
document.querySelector('#back').addEventListener('click', () => {
	if (currentStep > 0) {
		currentStep--
		showStep(currentStep)
		updateProgressBar(currentStep)
	} else {
		// return to landing and going back to default
		document.querySelector('#form-section').classList.remove('active')
		document.querySelector('#progress-bar').classList.remove('active')
		document.querySelector('#home').classList.add('active')
	}
})

// progress bar back-navigation
// i wanted to make the progress bar segments clickable so users can easily go back to previous questions without having to click "back" multiple times. the logic is that if users click on a segment in the progress bar that is marked as "done" (meaning they've already been to that step), it will take them back to that step. if they click on a segment that isn't marked as "done", nothing happens because they haven't reached that step yet. 
// https://claude.ai/share/ec7ea511-b8ca-4f6f-abcc-1d46515298b8
document.querySelectorAll('#progress-bar li').forEach((item, index) => {
	item.addEventListener('click', () => {
		const segment = item.querySelector('.segment')
		if (!segment.classList.contains('done')) return
		currentStep = index
		showStep(currentStep)
		updateProgressBar(currentStep)
	})
})

// next button
steps.forEach((step, index) => {
	step.addEventListener("click", () => {
		nextStep(index);
	});
});

// form progress bar
// https://dev.to/jolamemushaj/how-to-create-a-steps-progress-bar-4m2b
// i want to make a progress bar that fills in as users go through the form. i found this link and created a segmented progress bar. the list item is filled in when the user clicks "next" and moves on to the next question. i also added a class of "answered" to the step so that if users go back to previous questions, they can see which ones they've already answered.
// https://claude.ai/share/1711bc33-bec5-4693-b1c2-c5b9f57a7267
function updateProgressBar(currentStep) {
	const first = document.querySelector(".first");
	const second = document.querySelector(".second");
	const third = document.querySelector(".third");
	const fourth = document.querySelector(".fourth");
	const fifth = document.querySelector(".fifth");
	const progress = [first, second, third, fourth, fifth];

	progress.forEach((step, index) => {
		if (index === currentStep) {
			step.classList.add("active");
			step.classList.remove("done");
		} else if (index <= maxStep) {
			step.classList.remove("active");
			step.classList.add("done");
		} else {
			step.classList.remove("active");
			step.classList.remove("done");
		}
	});
}

// next button only if users input is valid
function isAnswered(step) {
	const radio = step.querySelector('input[type="radio"]')
	if (radio) return !!step.querySelector('input[type="radio"]:checked')
	const dropdown = step.querySelector('select')
	if (dropdown) return dropdown.value !== ''
	const checkbox = step.querySelector('input[type="checkbox"]')
	if (checkbox) return !!step.querySelector('input[type="checkbox"]:checked')
	// this means that if there are radios or dropdowns in the step, we check if they have a value before allowing users to click "next". If there aren't any radios or dropdowns, we just return true and allow users to click "next" without having to answer any questions (like for the energy level slider).
	// i only need it for radios and dropdowns because for other questions like my energyLevel slider, it starts at "1" but if users are already feeling "1", they don't have to move it and just click "next"
	return true
}

// show/hide/disable submit button
function showStep(index) {
	steps.forEach((step, i) => {
		step.classList.toggle('active', i === index)
	})

	const isLast = index === steps.length - 1
	submitBtn.hidden = !isLast
	submitBtn.disabled = !isAnswered(steps[index])
}
// when user advances, the current step is marked as "answered" so that if they go back, they can see which questions they've already answered. then it shows the next step and updates the progress bar
function advanceStep() {
	if (!isAnswered(steps[currentStep])) return
	steps[currentStep].classList.add('answered')
	currentStep++
	if (currentStep > maxStep) maxStep = currentStep
	showStep(currentStep)
	updateProgressBar(currentStep)
}

// auto-advance on radio change, or update submit state on last step
// i added an event listener to the form that listens for any changes. if the change is on a radio button, i want it to auto-advance to the next question (unless it's the last question, then i just want to update the submit button state). if the change is on any other input type, we just want to update the submit button state in case users go back and change their answers. my logic:
document.querySelector('#nightcap-form').addEventListener('change', (e) => {
	// this targets radio buttons and checks if the change event is coming from a radio input.
	if (e.target.type === 'radio') {
		if (currentStep === steps.length - 1) {
			showStep(currentStep)
		} else {
			advanceStep()
		}
		// if the current step is the last one, i'm updating to change to a submit button, otherwise, it'll advance to the next question
		// i also set a limit so users can only click 3 options for the "type of activity" question
		// the logic for the checkbox limit is that when a user clicks on a checkbox, it checks how many checkboxes are currently checked. if there are already 3 checked and the user tries to check another one, it will immediately uncheck it and not allow them to select more than 3
	} else if (e.target.type === 'checkbox') {
		const checked = document.querySelectorAll('[name="activity-type"]:checked')
		if (checked.length > 3) {
			e.target.checked = false
		}
		showStep(currentStep)
	} else {
		showStep(currentStep)
	}
})

// https://claude.ai/share/bfde2840-9524-4f30-9b73-bca713c43a6a
// i wanted to make the energy level question a range slider and have it auto-advance when users select their energy level. this function listens for input changes on the slider and then advances the step after a short delay (so it doesn't immediately jump to the next question while users are still adjusting the slider).
// auto-advance range slider after user releases
let sliderTimer = null
document.querySelector('#energy').addEventListener('input', () => {
	clearTimeout(sliderTimer)
	sliderTimer = setTimeout(advanceStep, 800)
})

// restart button on results page — triggers the form's reset event
document.querySelector('#results-restart').addEventListener('click', () => {
	document.querySelector('#nightcap-form').reset()
})

// reset button
document.querySelector('#nightcap-form').addEventListener('reset', () => {
	currentStep = 0
	maxStep = 0
	steps.forEach(step => step.classList.remove('answered'))
	document.querySelector('#result-recs').innerHTML = ''
	document.querySelector('#shuffle').hidden = true
	document.querySelector('#results-restart').hidden = true
	document.querySelector('#results').classList.remove('active')
	document.querySelector('#form-section').classList.add('active')
	document.querySelector('#progress-bar').classList.add('active')
	showStep(0)
	updateProgressBar(0)
})

// i changed the logic of the submit and randomize button from previous commits. now, the function showResults takes in a list of the results and handles all the display logic for both flows. 
// the submit button filters the data based on user input and then calls showResults with the filtered results. the randomize button just calls showResults with the full dataset to show random picks.
function showResults(results) {
	document.querySelector('#home').classList.remove('active')
	document.querySelector('#form-section').classList.remove('active')
	document.querySelector('#progress-bar').classList.remove('active')
	document.querySelector('#results').classList.add('active')

	const resultDiv = document.querySelector('#result-recs')
	const shuffleBtn = document.querySelector('#shuffle')
	const restartBtn = document.querySelector('#results-restart')

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
	// i also used spread for my links project to generate the randomized grid so i brought it back in. i'm defining all results, and remaining results because i only want to show 3 results a time and have users click the shuffle button to view more if the top 3 suggestions aren't good enough. the spread here is to make a dupe of allResults so that when i splice the remaining array to show 3 results, it doesn't modify allResults and i can always go back to the full list of results when i need to refill the remaining pool.
	let allResults = results
	let remaining = [...allResults]

	function showThree() {
		// if the pool is empty, all results have been seen
		if (remaining.length === 0) {
			resultDiv.innerHTML = '<p>You\'ve seen all the suggestions! Try restarting for new answers.</p>'
			shuffleBtn.hidden = true
			return
		}

		// shuffle the remaining pool into a random order
		remaining.sort(() => Math.random() - 0.5)

		// take up to 3 and remove them from the pool so they won't repeat
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
		let threeResults = remaining.splice(0, 3)

		const cardsHTML = threeResults.map(item =>
			`<div class="results-card">
				<img src="${item.image}" alt="${item.name}">
				<h4>${item.name}</h4>
			</div>`
		).join('')

		resultDiv.innerHTML = `<div class="carousel-track">${cardsHTML}</div>`

		// hide shuffle button after showing the last batch
		if (remaining.length === 0) {
			shuffleBtn.hidden = true
		}
	}

	if (results.length === 0) {
		resultDiv.innerHTML = '<p>No activities found. Try something else :)</p>'
		shuffleBtn.hidden = true
		restartBtn.hidden = false
	} else {
		showThree()
		restartBtn.hidden = false

		// only show the shuffle button if there are more than 3 results
		if (allResults.length > 3) {
			shuffleBtn.hidden = false
		}
	}

	// use onclick so re-triggering either flow replaces the handler instead of stacking it
	shuffleBtn.onclick = showThree
}

// randomise button — skips the form and shows random picks from the full dataset
document.querySelector('#random').addEventListener('click', () => {
	showResults(data)
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
	const activityTypeInput = document.querySelector('[name="activity-dropdown"]:checked')
	const activityType = activityTypeInput ? activityTypeInput.value : ''

	// map energy level 1-5
	// the values for energyLevel in .json is low/medium/high, but in the form, i wanted to give users the options to pick in-betweens (#2 or #4) so here, i'm defining what those values correspond to in the .json data.
	if (energyLevel <= 2) energyLevel = 'low'
		else if (energyLevel <= 3) energyLevel = 'medium'
		else energyLevel = 'high'

	const results = data.filter(item => {
		const criteria = item.criteria;
		// i am mapping through each item in the data and checking if it matches the user's selections. if any of the criteria don't match, i return false and that item is filtered out. If all criteria match, I return true and that item is included in the results.

		const inOut = criteria[0]["in/out"];
		if (inOrOut && !inOut[inOrOut.value])
			return false;

		const energy = criteria[1]["energy"];
		if (energyLevel && !energy[energyLevel])
			return false;

		const cost = criteria[2]["cost"];
		if (costSelection && !cost[costSelection.value])
			return false;

		const soloSocial = criteria[3]["solo/social"];
		if (soloOrSocial && !soloSocial[soloOrSocial.value])
			return false;

		const activityOptions = criteria[4]["type of activity"];
		if (activityType && !activityOptions.includes(activityType))
			return false;

		return true;
	});

	showResults(results)
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