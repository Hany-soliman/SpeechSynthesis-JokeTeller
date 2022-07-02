//Globals
const synth = window.speechSynthesis;
const speech = new SpeechSynthesisUtterance();
let voices
let joke
let isIOS = false
let selectedVoice
let volumeLevel = 1;
let rateLevel = 1;
let pitchLevel = 1;

//Selectors
const jokeContainer = document.getElementById('joke-container')
const customContainer = document.getElementById('user-container')
const jokeBtn = document.getElementById('joke-button')
const customBtn = document.getElementById('custom-button')
const backBtn = document.getElementById('back-btn')
const voicesMenu = document.getElementById('voice-select')
const addedText = document.getElementById('input-text')
const playBtn = document.getElementById('play-btn')
const pauseBtn = document.getElementById('pause-btn')
const stopBtn = document.getElementById('stop-btn')
const resumeBtn = document.getElementById('resume-btn')
const volume = document.getElementById('Volume')
const rate = document.getElementById('Rate')
const pitch = document.getElementById('Pitch')


//Fetch all voices and populate the dropDown
const initVoices = async () => {
    const getVoices = () => {
        return new Promise(resolve => {
            synth.onvoiceschanged = e => {
                resolve(voices = synth.getVoices(), selectedVoice = voices[0]);
            }
        })
    }
    await getVoices();
    addDropdownOptions()
};

//Fallback for IOS devices

const loadVoicesWhenAvailable = (onComplete = () => {
}) => {
    const data = synth.getVoices()
    if (data.length !== 0) {
        voices = data
        selectedVoice = voices[0]
        addDropdownOptions()
        onComplete()
    } else {
        return setTimeout(function () {
            loadVoicesWhenAvailable(onComplete)
        }, 100)
    }
}

//Check if the device is IOS

const ios = () => {
    if (typeof window === `undefined` || typeof navigator === `undefined`) return false;
    return /iPhone|iPad|iPod/i.test(navigator.userAgent || navigator.vendor || (window.opera && opera.toString() === `[object Opera]`));
};


//Create the dropDown

const addDropdownOptions = () => {
    voicesMenu.innerHTML = voices.map(voice => {
        return `<option>${voice.name}</option>`
    }).join('')
}
//Fetch Joke

const getJoke = async () => {
    const apiURL = 'https://v2.jokeapi.dev/joke/Any'
    try {
        const response = await fetch(apiURL)
        let data = await response.json()
        if (data.setup) {
            joke = [data.setup, data.delivery]
        } else {
            joke = data.joke
        }
    } catch (e) {
        throw new Error(`Uh Oh! encountered an error: ${e}`)
    }
}
//isIOS

const checkJokeType = (joke, type) => {
    if (Array.isArray(joke)) {
        jokeBtn.disabled = true
        type.text = joke[0]
        synth.speak(type)
        setTimeout(() => {
            type.text = joke[1]
            synth.speak(type)
        }, 1000)
    } else {
        type.text = joke
        synth.speak(type)
    }
}
//Send the joke to the Speech API

const tellMeAJoke = async () => {
    await getJoke()
    if (isIOS) {
        const utterance = new window.SpeechSynthesisUtterance()
        utterance.voice = voices[10]
        utterance.voiceURI = voices[10].voiceURI
        utterance.lang = voices[10].lang
        utterance.text = 'Add text to hear it back!'
        utterance.volume = volumeLevel
        utterance.rate = rateLevel
        utterance.pitch = pitchLevel
        checkJokeType(joke, utterance)
        utterance.addEventListener('start', disableBtns)
        utterance.addEventListener('end', enableBtns)
    } else {
        speech.lang = 'en-US'
        speech.volume = volumeLevel
        speech.rate = rateLevel
        speech.pitch = pitchLevel
        speech.voice = voices[1]
        checkJokeType(joke, speech)
    }
}


//Grab the voice object
const getVoice = (name, arr) => {
    for (const voice of arr) {
        if (name === voice.name) {
            return selectedVoice = voice
        }
    }
}


const play = () => {
    speech.lang = 'en-US'
    speech.voice = selectedVoice
    speech.volume = volumeLevel
    speech.rate = rateLevel
    speech.pitch = pitchLevel
    if (!addedText.value) {
        speech.text = 'Add text to hear it back!'
        synth.speak(speech)
    }
    if (!synth.speaking) {
        speech.text = addedText.value
        synth.speak(speech)
    }
}

//DOM Manipulation

const showCustomContainer = () => {
    jokeContainer.classList.add('hide')
    customContainer.classList.remove('hide')
}

const showJokeContainer = () => {
    jokeContainer.classList.remove('hide')
    customContainer.classList.add('hide')
}

const checkSelectedVoice = (e) => {
    getVoice(e.target.value, voices)
}

const disableBtns = () => {
    jokeBtn.disabled = true
    playBtn.disabled = true
}
const enableBtns = () => {
    jokeBtn.disabled = false
    playBtn.disabled = false
}

//Event Listeners
jokeBtn.addEventListener('click', tellMeAJoke)
customBtn.addEventListener('click', showCustomContainer)
backBtn.addEventListener('click', showJokeContainer)
voicesMenu.addEventListener('change', checkSelectedVoice)
playBtn.addEventListener('click', play)
pauseBtn.addEventListener('click', () => {
    synth.pause()
})
resumeBtn.addEventListener('click', () => {
    synth.resume()
})
stopBtn.addEventListener('click', () => {
    synth.cancel()
})
volume.addEventListener('input', (e) => {
    volumeLevel = +e.target.value
})
rate.addEventListener('input', (e) => {
    rateLevel = +e.target.value
})
pitch.addEventListener('input', (e) => {
    pitchLevel = +e.target.value
})
speech.addEventListener('start', disableBtns)
speech.addEventListener('end', enableBtns)



//onLoad

initVoices().then(() => {
    console.log('voices loaded successfully')
})

if (ios()) {
    loadVoicesWhenAvailable()
    isIOS = true
}

