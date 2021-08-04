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

- SCSS

# Decisions/choices outside the instructions/requirements
- Instead of loading the entire inbox in a single request when the user clicks the "start" button in the interface, the emails are loaded in batches of 25.<br>
In the initial request made when "start" is clicked, 25 emails are loaded. To load more emails subsequently, the user has to click the "load more" button and the 
next 25 emails in the inbox will be loaded.

- Instead of having authentication credentials provided as environment variables, they are entered in a form in the interface.<br>
This will allow ease of usage, to test the client with multiple credentials. The only configurations that are environment variables are the hostnames and ports.

# How to run
Per the instructions, this project/submission is available as an image on Docker Hub - both the frontend client and backend service are in the same image.

## Steps to run
- Pull the image of this submission/project from the Docker Hub
```
docker pull overrideveloper/mailbird-test:latest
```
- To run this image locally, there are a couple of things that need to be done:
1. Provide the required environment variables. These environment variables are:
- **IMAP_HOST**: The hostname of the IMAP server.
- **POP3_HOST**: The hostname of the IMAP server.

2. Port mapping.<br> The port where the backend service runs on and the port where the frontend client runs on should be mapped to ports on your local machine.<br>
- **Frontend port mapping**: The frontend client runs on an NGINX server on **port 80**. This port has to be mapped to a port on your local machine.
- **Backend service port mapping**: The backend service runs on a Node server on port 3000, so you have to map this port to the exact port on your local machine.

This is the format of the command to run this image locally:
```
docker run -p 3000:3000 -p <port-on-your-machine>:80 -e IMAP_HOST=<imap-host> -e POP3_HOST=<pop3-host> overrideveloper/mailbird-test:latest
```

After running this command, you should see the email client at `<your-local-ip>:<port-on-your-machine>`.

**NOTE**: Any port you are mapping to must not be in use on your local machine

Here is an example:
```
docker run -p 3000:3000 -p 8080:80 -e IMAP_HOST=imap.gmail.com -e POP3_HOST=pop3.gmail.com overrideveloper/mailbird-test:latest
```
The email client should be running at `localhost:8080`.<br><br>


**NOTE**: This project/submission uses these are the default IMAP and POP3 ports:
- IMAP (SSL/TLS): 993
- POP3 (SSL/TLS): 995
- IMAP (Unencrypted): 143
- POP3 (Unencrypted): 110

If the server you wish to connect to has different ports, you can override these values by providing the following environment variables
- **IMAP_PORT_SSL** - For IMAP (SSL/TLS)
- **POP3_PORT_SSL** - For POP3 (SSL/TLS)
- **IMAP_PORT_NOSSL** - IMAP (Unencrypted)
- **POP3_PORT_NOSSL** - POP3 (Unencrypted)

# What would I improve?
What I would improve would be to have the backend service and frontend client be in two different images and subsequently two different containers with a bridge network.<br>
This would allow the backend service and frontend client to be able to developed, deployed and scaled independent of the other.
