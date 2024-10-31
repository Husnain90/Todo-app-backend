const http = require("http");
const fs = require("fs");
const path = require("path");
const server = http.createServer((req, res) => {
  console.log("server hit");
  // sign up end point
  if (req.method === "POST" && req.url === "/api/v1/signUp") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      // console.log(body);
      // console.log("Received post data ", body);
      // console.log("before parse", body);
      const parsedData = JSON.parse(body);
      // console.log("the parsedd", parsedData);
      // console.log("again converted to string", JSON.stringify(parsedData));
      appendDataTofile("data.json", parsedData);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(parsedData));
    });

    res.on("error", (e) => {
      console.log(`we got an error = ${e.message}`);
      res.end("Internal server error");
    });
  }
  // login end point
  else if (req.method === "POST" && req.url === "/api/v1/login") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const convData = JSON.parse(body);
      console.log(convData);
      try {
        fs.readFile("data.json", "utf-8", (err, data) => {
          const jsObj = JSON.parse(data);
          const filterData = jsObj.find(
            (person) => person.email === convData.email
          );
          if (filterData.password === convData.password) {
            res.setHeader(
              "set-cookie",
              `id=${filterData.id}; Path=/; httpOnly`
            );
            res.end("success");
          } else {
            res.end("wrong pasword");
          }
        });
      } catch (err) {
        console.log(err);
        res.end("server is down");
      }
    });
  }
  // logout end point
  else if (req.method === "POST" && req.url === "/api/v1/logout") {
    console.log("111");
    res.setHeader(
      "set-cookie",
      "id=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/"
    );

    res.end("Logged out");
  }
  // add to do
  else if (req.method === "POST" && req.url === "/api/v1/add-todo") {
    console.log("yello");
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const convBody = JSON.parse(body);
      const cookies = req.headers.cookie;
      // console.log("im the cookie", cookies);
      // const id = cookies ? cookies.split("; ").find(cookie=> cookie.)
      const extractCookie = cookies.split("=")[1];
      console.log(extractCookie);
      fs.readFile("data.json", "utf-8", (err, data) => {
        const convJson = JSON.parse(data);
        const filterPerson = convJson.find(
          (person) => person.id === parseInt(extractCookie)
        );

        if (filterPerson) {
          const formatData = {
            id: Date.now(),
            user_id: parseInt(extractCookie),
            ...convBody,
          };
          console.log(formatData);
          appendDataTofile("data.json", formatData);
          res.end("todo created");
        } else {
          console.log("you are not authorize");
          res.end("todo is not created");
        }
      });
    });
  }
  // update to do
  else if (req.method === "POST" && req.url === "/api/v1/update-todo") {
    console.log("melo");
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const convBody = JSON.parse(body);
      const cookies = req.headers.cookie;
      // console.log("im the cookie", cookies);
      // const id = cookies
      const extractCookie = cookies.split("=")[1];
      console.log(extractCookie);
      fs.readFile("data.json", "utf-8", (err, data) => {
        const convJson = JSON.parse(data);
        const filterPerson = convJson.find(
          (person) => person.id === parseInt(extractCookie)
        );

        if (filterPerson) {
          const filterTodo = convJson.find(
            (todo) => todo.id === parseInt(convBody.id)
          );
          // Update the todo with the new task
          const task = convBody.task;
          console.log("here is todo", filterTodo);
          console.log({ ...filterTodo, task });
          const updatedTask = { ...filterTodo, task };

          const allTodos = convJson.filter(
            (todo) => todo.id !== parseInt(convBody.id)
          );

          console.log("filterd all todays ", allTodos);
          resetJsonFile();
          allTodos.push(updatedTask);

          // console.log("here is the todo", updatedFile);
          writeToFile("data.json", allTodos);
          res.end("todo updated");
        } else {
          console.log("you are not authorize");
          // res.end("todo is not created");
          res.end("You are not authorized");
        }
      });
    });
  } else if (req.method === "POST" && req.url === "/api/v1/delete-todo") {
    console.log("delete route");
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const convBody = JSON.parse(body);
      const cookies = req.headers.cookie;
      const extractCookie = cookies.split("=")[1];
      console.log(extractCookie);
      fs.readFile("data.json", "utf-8", (err, data) => {
        const convJson = JSON.parse(data);
        const filterPerson = convJson.find(
          (person) => person.id === parseInt(extractCookie)
        );

        if (filterPerson) {
          const allTodos = convJson.filter(
            (todo) => todo.id !== parseInt(convBody.id)
          );

          console.log("filterd all todays ", allTodos);
          resetJsonFile();

          writeToFile("data.json", allTodos);
          res.end("todo deleted");
        } else {
          console.log("you are not authorize");
          // res.end("todo is not created");
          res.end("You are not authorized");
        }
      });
    });
  }
  // get the user
  else if (req.method === "POST" && req.url === "/api/v1/getbyId") {
    console.log("get hit");
    let id = "";
    req.on("data", (chunk) => {
      id += chunk;
    });

    req.on("end", () => {
      // console.log(id);
      const parseId = JSON.parse(id);
      // console.log(parseId.id);
      fs.readFile("data.json", "utf8", (err, data) => {
        const jsObj = JSON.parse(data);

        const filterdata = jsObj.find(
          (person) => person.id === parseInt(parseId.id)
        );
        // console.log(jsObj);
        console.log("here is the", filterdata);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(filterdata));
      });
    });
  }
  // upload-file
  else if (req.method === "POST" && req.url === "/api/v1/upload-file") {
    console.log("the upload-file route hit");
    const contentType = req.headers["content-type"];
    const boundary = "--" + contentType.split("=")[1];
    console.log(boundary);

    let rawData = Buffer.alloc(0);

    req.on("data", (chunk) => {
      rawData = Buffer.concat([rawData, chunk]);
    });
    req.on("end", () => {
      const parts = rawData.toString().split(boundary);
      console.log("yellow");
      console.log("this is the ", parts);
      parts.forEach((part) => {
        if (part.includes("Content-Disposition")) {
          const [headers, fileContent] = part.split("\r\n\r\n");
          console.log("headers", headers.trim());
          console.log(
            "File content (binary data):",
            Buffer.from(fileContent.trim(), "binary")
          );
          const fileNameMatch = headers.match(/filename="(.+?)"/);
          if (fileNameMatch) {
            const fileName = fileNameMatch[1].trim();
            const filePath = path.join(__dirname, fileName);
            const endIndex = fileContent.lastIndexOf("\r\n");
            const binaryData = Buffer.from(
              fileContent.slice(0, endIndex).trim(),
              "binary"
            );
            fs.writeFile(filePath, binaryData, "binary", (err) => {
              if (err) {
                console.error(`Error saving file: ${err.message}`);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Failed to save file.");
                return;
              }
              console.log(`File saved as ${filePath}`);
              res.writeHead(200, { "Content-Type": "text/plain" });
              res.end("File uploaded and saved successfully.");
            });
          }
        }
      });
    });
  } else {
    res.end("Hello from Node.js");
  }
});
server.listen(8000, () => console.log("server is running"));

// reading exisiting data from the file
//converting the data to js obj
// adding id to data
// pushing data to converted js obj
// now converted that data to the string
// writing file with this converted string data
const appendDataTofile = (filePath, newDaTa) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.log("error reading file", err);
      return;
    }
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (err) {
      console.log(err);
      return;
    }
    const newDataWithId = { id: Date.now(), ...newDaTa };
    jsonData.push(newDataWithId);
    const updatedData = JSON.stringify(jsonData);
    fs.writeFile(filePath, updatedData, (err) => {
      if (err) {
        console.log("Error writing ", err);
        return;
      }
      console.log("Data appeneded succesfully");
    });
  });
};

const resetJsonFile = () => {
  fs.writeFile("data.json", JSON.stringify([]), (err) => {
    if (err) {
      console.log("file failed to reset ");
    } else {
      console.log("file reset succesfully");
    }
  });
};
const writeToFile = (filePath, data) => {
  fs.writeFile(filePath, JSON.stringify(data), (err) => {
    if (err) {
      console.log("fail to write data");
    } else {
      console.log("data stored successfully ");
    }
  });
};
