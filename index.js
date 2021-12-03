const { Deepgram } = require('@deepgram/sdk');
const fs = require('fs');
const util = require('util');
const jq = require('node-jq');

const apiKey = '60a0007fa4a7610f1b1ac4a14a08f0d6c2f17cc1';

const filePath = 'commercial_mono.wav'; 

const deepgram = new Deepgram(apiKey);

const bufferSource = { 
  buffer: fs.readFileSync(filePath), 
  mimetype: 'audio/wav',
};

deepgram.transcription.preRecorded(bufferSource, {
  //For clarity and accuracy of the transcription, I turned on both punctuate.
  punctuate: true,

  //Diarize and Utterance was turned on to identify which speaker was speaking (diarize) with punctuation (utterance).
  diarize: true,
  utterances: true
})
.then((transcription) => {
  // console.log(util.inspect(transcription, {showHidden: false, depth: null, colors: true}));
  // console.log(transcription.results.utterances)
  // I used the console.log's above to see what the output was; I used Util to have more
  // detail in the printed object

  const filter = '[.[] | { speaker, transcript }]';
  const json = transcription.results.utterances;
  const options = { input: 'json'};
  
  jq.run(filter, json, options)
    .then(result => {
      // console.log("result", result, typeof result)

      // Since the result came out as a string type, I used JSON parse to parse it into a JSON Array
      const resultObject = JSON.parse(result)

      let prettifiedTranscript = '';

      for(let i = 0; i < resultObject.length; i++){
        // console.log(resultObject[i]);
        let speaker = resultObject[i].speaker;
        let line = resultObject[i].transcript;
        prettifiedTranscript += `Speaker ${speaker}: ${line}` + "\n"
      }

      console.log(prettifiedTranscript);
      
    })
    .catch(err => {
      console.log(err);
    })
 
})
.catch((err) => {
  console.log(err);
})


