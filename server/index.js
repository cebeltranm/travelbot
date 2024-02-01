import cors from 'cors';
import express from 'express';

var app = express();
import OpenAI from "openai";

const openai = new OpenAI();

const ASSISTANT_ID = 'asst_lo0EOYqqEro5UK5kdOeXBKk6';
const JSON_CONTENT_REGEX = /```json([^`]+)```/g;

app.use(cors());
app.use(express.json());

var port = 8181;
app.get('/_ping', function (request, response) {
    console.log('ping');
    response.status(200).end();
});

app.post('/command', async (request, response) => {
    const thread = request.body.thread || (await openai.beta.threads.create()).id;
    console.log(request.body);
    try {
        const threadMessages = await openai.beta.threads.messages.create(
            thread,
            { role: "user", content: request.body.command }
        );

        console.log(threadMessages);

        const run = await openai.beta.threads.runs.create(
            thread,
            { 
                assistant_id: ASSISTANT_ID,
                additional_instructions: request.body.context,
                instructions: request.body.instructions
            },
        );
        
        console.log(run);

        response.status(200).json({
            thread: thread,
            run_id: run.id
        });
    } catch (e) {
        response.status(500).json({
            error: e.message
        });
    }
})

app.get('/command/:thread/:run', async (request, response) => {
    let messageContent = null;
    let messageType = null;

    console.log(request.params);

    const run = await openai.beta.threads.runs.retrieve(
        request.params.thread,
        request.params.run
      );
    console.log(run);
    if (run.status === 'completed') {
        const runStep = await openai.beta.threads.runs.steps.list(
            request.params.thread,
            request.params.run
        );        
        if (runStep.data.length > 0 && runStep.data[0].step_details  && runStep.data[0].step_details.message_creation) {
            const message = await openai.beta.threads.messages.retrieve(
                request.params.thread,
                runStep.data[0].step_details.message_creation.message_id
            );
            try {
                const matches = [...message.content[0].text.value.matchAll(JSON_CONTENT_REGEX)];
                if (matches.length > 0) {
                    messageContent = JSON.parse(matches[0][1].trim());
                    messageType = 'json';
                }
            }catch (e) {}
            if (!messageContent) {
                messageContent = message.content[0].text.value;
                messageType = 'text';
            }
            console.log(messageContent);
        }
    }

    response.status(200).json({
        status: run.status,
        messageContent,
        messageType,
    });

});


// app.post(/\/.*\.json$/, function (req, res) {
//     fs.writeFile(__dirname + '/../.tmp'+req.path, JSON.stringify(req.body), function (err) {
//         console.log('Saved file ', req.path);
//         if (err) {
//             console.log(err);
//             return res.status(500).send(JSON.stringify(err)).end();
//         }
//         res.status(200).end();
//     });
// });

// // Anything put in the public folder is available to the world!
// app.use(express.static(__dirname + '/../.tmp'));
app.listen(port, function () {
    console.log("Listening on port: ".concat(port));
});
