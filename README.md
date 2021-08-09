# What is this?
This is my submission for the Mailbird Fullstack Engineer test to build a web-based email client that can fetch emails from IMAP and POP3 servers

# What is it built with/on?
This submission/project is built with:
- [Angular](https://www.npmjs.com/package/@angular/cli)
- [Typescript](https://www.npmjs.com/package/typescript)
- [RxJS](https://www.npmjs.com/package/rxjs)
- [Bootstrap](https://www.npmjs.com/package/bootstrap)

- Node.js / [Express.js](https://www.npmjs.com/package/express)
- [imap](https://www.npmjs.com/package/imap)
- [poplib](https://www.npmjs.com/package/poplib)
- [pEvent](https://www.npmjs.com/package/p-event)

- SCSS

# Decisions/choices outside the instructions/requirements
- Instead of loading the entire inbox in a single request when the user clicks the "start" button in the interface, the emails are loaded in batches of 25.<br>
In the initial request made when "start" is clicked, 25 emails are loaded. To load more emails subsequently, the user has to click the "load more" button and the 
next 25 emails in the inbox will be loaded.

# How to run
Per the instructions, this project/submission is available as an image on Docker Hub - both the frontend client and backend service are in the same image.

## Steps to run
- Pull the image of this submission/project from the Docker Hub
```
docker pull overrideveloper/mailbird-test:latest
```

- Run the image and map the exposed container port (**which is 5000**) to a port on your local machine:
```
docker run -p <port-on-your-machine>:5000 overrideveloper/mailbird-test:latest
```

After running this command, you should see the email client at `<your-local-ip>:<port-on-your-machine>`.

**NOTE**: Any port you are mapping to must not be in use on your local machine

Here is an example:
```
docker run -p 8080:5000 overrideveloper/mailbird-test:latest
```
The email client should be running at `localhost:8080`.<br><br>

# What would I improve?
What I would improve would be to have the backend service and frontend client be in two different images and subsequently two different containers with a bridge network.<br>
This would allow the backend service and frontend client to be able to developed, deployed and scaled independent of the other.
