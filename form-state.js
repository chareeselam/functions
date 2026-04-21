
document.querySelector('#personalize').addEventListener('click', () => {
	document.querySelector('#home').classList.remove('active')
	document.querySelector('#form-section').classList.add('active')
	document.querySelector('#progress-bar').classList.add('active')
})

const questions = document.querySelectorAll('.question')
const submitBtn = document.querySelector('#submit')
let currentQuestion = 0
let maxQuestion = 0
let data = []

// load data then show question one
// this is a fetch request to get the data from the .json file
// i learned that fetch returns a promise and that we can chain .then() to handle the response
// the first .then() converts the response to JSON, and the second .then() assigns the JSON data to our variable and shows the first question of the form
fetch('data.json')
	.then(response => response.json())
	// https://developer.mozilla.org/en-US/docs/Web/API/Response/json
	.then(json => {
		data = json
		showQuestion(0)
		updateProgressBar(0)
	})

// back button
// the back button just moves back a question and updates the progress bar. if users are on the first question and click back, it takes them to the landing page and resets the form state
document.querySelector('#back').addEventListener('click', () => {
	if (currentQuestion > 0) {
		currentQuestion--
		showQuestion(currentQuestion)
		updateProgressBar(currentQuestion)
	} else {
		// return to landing and going back to default
		document.querySelector('#form-section').classList.remove('active')
		document.querySelector('#progress-bar').classList.remove('active')
		document.querySelector('#home').classList.add('active')
	}
})

// progress bar back-navigation
// i wanted to make the progress bar segments clickable so users can easily go back to previous questions without having to click "back" multiple times. the logic is that if users click on a segment in the progress bar that is marked as "done" (meaning they've already been to that question), it'll take them back to that question. if they click on a segment that isn't marked as "done", nothing happens because they haven't reached that question yet.
// https://claude.ai/share/ec7ea511-b8ca-4f6f-abcc-1d46515298b8
document.querySelectorAll('#progress-bar li').forEach((item, index) => {
	item.addEventListener('click', () => {
		const segment = item.querySelector('.segment')
		if (!segment.classList.contains('done')) return
		currentQuestion = index
		showQuestion(currentQuestion)
		updateProgressBar(currentQuestion)
	})
})

// next button
questions.forEach((question, index) => {
	question.addEventListener("click", () => {
		nextQuestion(index);
	});
});

// form progress bar
// https://dev.to/jolamemushaj/how-to-create-a-steps-progress-bar-4m2b
// i want to make a progress bar that fills in as users go through the form. i found this link and created a segmented progress bar. the list item is filled in when the user clicks "next" and moves on to the next question. i also added a class of "answered" to the question so that if users go back to previous questions, they can see which ones they've already answered.
// https://claude.ai/share/1711bc33-bec5-4693-b1c2-c5b9f57a7267
function updateProgressBar(currentQuestion) {
	const progress = document.querySelectorAll('.segment')

	progress.forEach((segment, index) => {
		if (index === currentQuestion) {
			segment.classList.add("active");
			segment.classList.remove("done");
		} else if (index <= maxQuestion) {
			segment.classList.remove("active");
			segment.classList.add("done");
		} else {
			segment.classList.remove("active");
			segment.classList.remove("done");
		}
	});
}

// next button only if users input is valid
function isAnswered(question) {
	const radio = question.querySelector('input[type="radio"]')
	if (radio) return !!question.querySelector('input[type="radio"]:checked')
	const dropdown = question.querySelector('select')
	if (dropdown) return dropdown.value !== ''
	const checkbox = question.querySelector('input[type="checkbox"]')
	if (checkbox) return !!question.querySelector('input[type="checkbox"]:checked')
	// this means that if there are radios or dropdowns in the question, we check if they have a value before allowing users to click "next". If there aren't any radios or dropdowns, we just return true and allow users to click "next" without having to answer any questions (like for the energy level slider).
	// i only need it for radios and dropdowns because for other questions like my energyLevel slider, it starts at "1" but if users are already feeling "1", they don't have to move it and just click "next"
	return true
}

// show/hide/disable submit button
function showQuestion(index) {
	questions.forEach((question, i) => {
		if (i === index) {
			question.classList.add('active')
		} else {
			question.classList.remove('active')
		}
	})

	const isLast = index === questions.length - 1
	submitBtn.hidden = !isLast
	submitBtn.disabled = !isAnswered(questions[index])
	document.querySelector('.thinking-dog').hidden = isLast
}

// when user advances, the current question is marked as "answered" so that if they go back, they can see which questions they've already answered. then it shows the next question and updates the progress bar
function advanceQuestion() {
	if (!isAnswered(questions[currentQuestion])) return
	questions[currentQuestion].classList.add('answered')
	currentQuestion++
	if (currentQuestion > maxQuestion) maxQuestion = currentQuestion
	showQuestion(currentQuestion)
	updateProgressBar(currentQuestion)
}

// auto-advance on radio click — (i originally had it as 'change' but i changed it to 'click' so that if users go back to previously answered questions, re-clicking an already-selected answer also advances)
document.querySelector('#nightcap-form').addEventListener('click', (e) => {
	if (e.target.type === 'radio') {
		if (currentQuestion === questions.length - 1) {
			showQuestion(currentQuestion)
		} else {
			advanceQuestion()
		}
	}
})

// i also set a limit so users can only click 3 options for the "type of activity" question
// the logic for the checkbox limit is that when a user clicks on a checkbox, it checks how many checkboxes are currently checked. if there are already 3 checked and the user tries to check another one, it will immediately uncheck it and not allow them to select more than 3
document.querySelector('#nightcap-form').addEventListener('change', (e) => {
	if (e.target.type === 'checkbox') {
		const checked = document.querySelectorAll('[name="activity-type"]:checked')
		if (checked.length > 3) {
			e.target.checked = false
		}
		showQuestion(currentQuestion)
	} else if (e.target.type !== 'radio') {
		showQuestion(currentQuestion)
	}
})

// https://claude.ai/share/bfde2840-9524-4f30-9b73-bca713c43a6a
// i wanted to make the energy level question a range slider and have it auto-advance when users select their energy level. this function listens for input changes on the slider and then advances the question after a short delay (so it doesn't immediately jump to the next question while users are still adjusting the slider).
// auto-advance range slider after user releases
let sliderTimer = null
document.querySelector('#energy').addEventListener('input', () => {
	clearTimeout(sliderTimer)
	sliderTimer = setTimeout(advanceQuestion, 800)
})

// restart button on results page — goes home, then resets form
document.querySelector('#results-restart').addEventListener('click', () => {
	document.querySelector('#results').classList.remove('active')
	document.querySelector('#progress-bar').classList.remove('active')
	document.querySelector('#home').classList.add('active')
	document.querySelector('#nightcap-form').reset()
})

// reset — clears state and returns to question 1 (form section stays active if already there)
document.querySelector('#nightcap-form').addEventListener('reset', () => {
	currentQuestion = 0
	maxQuestion = 0
	questions.forEach(question => question.classList.remove('answered'))
	document.querySelector('#result-recs').innerHTML = ''
	document.querySelectorAll('.result-dot').forEach(e => { e.hidden = false; e.classList.remove('active') })
	document.querySelector('#result-counter').hidden = true
	document.querySelector('#results-restart').hidden = true
	showQuestion(0)
	updateProgressBar(0)
})

// this function showResults is responsible for displaying the results after the user submits the form or clicks the randomize button. it takes in a list of results and updates the DOM to show the recommendations. 
// also handles the navigation logic for going through multiple recommendations if there are more than one (more below)
// if there are no results, it shows a message to the user indicating that no activities were found.
function showResults(results) {
	document.querySelector('#home').classList.remove('active')
	document.querySelector('#form-section').classList.remove('active')
	document.querySelector('#progress-bar').classList.remove('active')
	document.querySelector('#results').classList.add('active')

	const resultDiv = document.querySelector('#result-recs')
	const dots = document.querySelectorAll('.result-dot')
	const counter = document.querySelector('#result-counter')
	const currentCounter = document.querySelector('#current-counter')
	const totalCounter = document.querySelector('#total-counter')
	const restartBtn = document.querySelector('#results-restart')
	const prevBtn = document.querySelector('#prev-recs')
	const nextBtn = document.querySelector('#next-recs')

	// edge case: no results found
	// shows message and hides navigation if there are no results
	if (results.length === 0) {
		resultDiv.innerHTML = '<p>No activities found. Try something else <img src="assets/icons/smiley.svg" alt="Smiley"></p>'
		dots.forEach(e => e.hidden = true)
		counter.hidden = true
		prevBtn.hidden = true
		nextBtn.hidden = true
		restartBtn.hidden = false
		return
	}

	// i added navigation dots to give users feedback on how many recommendations are available. i set a max limit (maxDots) to show 5 dots, but if there are more than 5 recommendations, the active dot is mapped proportionally (in the middle). i also added a "n of N" counter to inform/show users how many recommendations are available
	const maxDots = 5
	let currentIndex = 0

	function updateDots() {
		const total = results.length
		const count = Math.min(total, maxDots)
		// since i set the max number of dots to 5, and index starts at 0, the middle dot is at index 2, so the formula to find the middle index is (count - 1) / 2
		// for example, if there are 5 or more results, the middle dot is at index 2 (the third dot). if there are 3 results, the middle dot is at index 1 (the second dot)
		const middle = Math.floor((count - 1) / 2)
		
		let activeDot
		if (total <= maxDots) {
			activeDot = currentIndex
		} else {
			const distanceFromEnd = total - 1 - currentIndex
			const dotsAfterMiddle = count - 1 - middle

			if (currentIndex <= middle) {
				activeDot = currentIndex
			// if there are more than 5 results and the user is on the first half, the active dot correspondes to their current index
			} else if (distanceFromEnd <= dotsAfterMiddle) {
				// but if there are more than 5 results and the user is on the second half, the active dot corresponds to how close they are to the end (so if they're on the last result, the last dot is active)
				// for example, if there are 10 results, and users are on results 3-7, the middle dot (index 2) is active. if they're on result 2, the second dot is active. if they're on result 9, the second last dot is active
				activeDot = count - 1 - distanceFromEnd
			} else {
				activeDot = middle
			}
		}

		dots.forEach((dot, i) => {
			// i = index
			dot.hidden = i >= count
			if (i === activeDot) {
				dot.classList.add('active')
			} else {
				dot.classList.remove('active')
			}
		})

		currentCounter.textContent = currentIndex + 1
		totalCounter.textContent = total
	}
	// recommendation navigation logic
	// i'm showing one recommendation at a time and letting users navigate through them using the next and previous buttons. the showOne function updates the recommendation card shown based on the current index
	function showOne(direction = '') {
		const item = results[currentIndex]
		const newCard = `<div class="results-card">
				<img src="${item.image}" alt="${item.name}">
				<h4>${item.name}</h4>
			</div>`

		function renderNew() {
			resultDiv.dataset.dir = direction
			resultDiv.innerHTML = newCard
			updateDots()
			// disables/enables the next/previous buttons as needed (for example, if users are on the first recommendation, the previous button is disabled)
			prevBtn.disabled = currentIndex === 0
			nextBtn.disabled = currentIndex === results.length - 1
		}

		// here, i'm checking if there's an existing recommendation card shown. if there isn't, i just render the new card
		// if there is, i play an exit animation based on the direction of navigation (left for previous, right for next) and then render the new card after the animation ends
		const existing = resultDiv.firstElementChild
		if (direction === '' || existing === null) {
			renderNew()
			return
		}

		prevBtn.disabled = true
		nextBtn.disabled = true
		if (direction === 'right') {
			resultDiv.dataset.dir = 'exit-left'
		} else {
			resultDiv.dataset.dir = 'exit-right'
		}
		existing.addEventListener('animationend', renderNew, { once: true })
	}

	// i'm rendering the first recommendation and showing the navigation buttons (unless there are only one result)
	showOne()
	counter.hidden = false
	restartBtn.hidden = false
	prevBtn.hidden = results.length <= 1
	nextBtn.hidden = results.length <= 1

	// next/previous button event listeners
	prevBtn.addEventListener('click', () => {
		if (currentIndex > 0) {
			currentIndex--
			showOne('left')
		}
	})

	nextBtn.addEventListener('click', () => {
		if (currentIndex < results.length - 1) {
			currentIndex++
			showOne('right')
		}
	})
}

// randomize button — skips the form and shows random picks in the randomized layout
// same logic as "submit" button but without the filtering — just shows all the activities in a random order and lets users shuffle through them using the same navigation as the results page
document.querySelector('#randomize').addEventListener('click', () => {
	document.querySelector('#home').classList.remove('active')
	document.querySelector('#results-randomized').classList.add('active')

	const pool = [...data].sort(() => Math.random() - 0.5)
	let currentIndex = 0

	const resultDiv = document.querySelector('#result-recs-random')
	const restartBtn = document.querySelector('#results-restart-random')
	const shuffleBtn = document.querySelector('#results-shuffle')

	function showOne(direction = '') {
		const item = pool[currentIndex]
		const newCard = `<div class="results-card">
				<img src="${item.image}" alt="${item.name}">
				<h4>${item.name}</h4>
			</div>`

		function renderNew() {
			resultDiv.dataset.dir = direction
			resultDiv.innerHTML = newCard
			shuffleBtn.disabled = currentIndex === pool.length - 1
		}

		const existing = resultDiv.firstElementChild
		if (direction === '' || existing === null) {
			renderNew()
			return
		}

		shuffleBtn.disabled = true
		resultDiv.dataset.dir = 'exit-left'
		existing.addEventListener('animationend', renderNew, { once: true })
	}

	showOne()
	restartBtn.hidden = false
	shuffleBtn.hidden = false
	shuffleBtn.disabled = false

	shuffleBtn.onclick = () => { if (currentIndex < pool.length - 1) { currentIndex++; showOne('right') } }

	restartBtn.onclick = () => {
		document.querySelector('#results-randomized').classList.remove('active')
		document.querySelector('#home').classList.add('active')
		resultDiv.innerHTML = ''
		restartBtn.hidden = true
		shuffleBtn.hidden = true
	}
})

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
	const selectedActivityTypes = [...document.querySelectorAll('[name="activity-type"]:checked')].map(el => el.value)

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
		if (selectedActivityTypes.length > 0 && !selectedActivityTypes.some(t => activityOptions.includes(t)))
			return false;

		return true;
	});

	showResults(results)
})