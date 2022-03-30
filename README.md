To run the application localy you need to follow these steps:
1.  git clone https://github.com/Itay-Talias/NodeServer
2.	npm i
3.	npx ts-node src/app.ts
 
The URL for the deployed application is 3.92.197.220
Port: 8080
 
The application supports posts requests.
To testing the application you need to send a post request to 3.92.197.220:8080/get with JSON that include:
1.	“region” : “your region” (string) – to get a list of EC2 instances in a specified region.
2.	“sort” : “attributes” (string) – to get a sorted list of  EC2 instances by attributes.
3.	“page” : page number (number) – to get a page number of  EC2 instances that you chose.
4.	“running” : true (Boolean) – to get a list of active EC2 instances.
5.	“secret” : “CISCO”(string) – you need to add this row to get results, without this you can’t get results (for security).
 
JSON for example:
{
    "region" : "us",
    "sort" : "privateIPs",
    "page" : 1,
    "running" : true,
    "secret" : "CISCO"
}