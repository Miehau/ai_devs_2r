import { getTask, answer } from "./utils/shared";


const taskData = await getTask('functions')


const addUser = {
    type: "function",
    function: {
      name: "addUser",
      description: "Get the current weather in a given location",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "First name of an user",
          },
          surname: {
            type: "string",
            description: "Last name of an user",
          },
          year: {
            type: "integer",
            description: "Year of birth"
          }
        }
      },
    },
  }

  console.log(addUser.function)
  answer(addUser.function)