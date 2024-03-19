import { answer, getTask } from "./utils/shared"

getTask('helloapi')
    .then(data => {
        answer(data.cookie)
    });