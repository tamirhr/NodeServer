import express, { Application, Request, Response } from "express";
const { authorizeSecret } = require('./auth.ts')

const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/env-file.env` });

const app : Application = express();
const port : number = 8080;
const PAGE_SIZE : number = 10;
const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");
const secret = process.env.SECRET

const client = new EC2Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

interface EC2Instance{
    [key: string]: string;
    name: string;
    ID: string;
    type: string;
    state: string;
    region: string;
    publicIP: string;
    privateIPs: string;
}


const getInstances = async (): Promise<EC2Instance[]> => {
  try {
    const command = new DescribeInstancesCommand({ DryRun: false });
    const data = await client.send(command)
    return parseInstances(data);

  } catch (e: any) {
    console.log(e);
    throw new Error(e.message);
  }
};

const parseInstances = (data: any) : EC2Instance[] => {
    return data.Reservations.map((reservation: any) => { 
        return reservation.Instances.map((instance: any) => {
          return {
            name: instance.Tags.find((tag: any) => tag.Key === "Name").Value,
            ID: instance.InstanceId,
            type: instance.InstanceType,
            state: instance.State.Name,
            region: instance.Placement.AvailabilityZone,
            publicIP: instance.PublicIpAddress,
            privateIPs: instance.PrivateIpAddress,
          };
        });
      }).flat();
}
app.use(express.json());
app.use(authorizeSecret(secret));

app.get("/", async (req: Request, res: Response) => {    
    res.send(await getInstances()); 
});

app.post("/get", async (req: Request, res: Response) => {
    const { sort, page, region, running }: {sort: string | undefined, page: number | undefined,region: string | undefined, running: Boolean | undefined } = req.body;
    const instances = await getInstances();
    const sortedInstances = sort ? instances.sort((a: EC2Instance, b: EC2Instance) => a[sort] > b[sort] ? 1 : -1) : instances;
    const paginatedInstances = page ? sortedInstances.slice((page-1) * PAGE_SIZE, (page-1) * PAGE_SIZE + PAGE_SIZE) : sortedInstances.slice(0, PAGE_SIZE);
    const regionInstance = region ? paginatedInstances.filter((a : EC2Instance) => a.region.includes(region)) : paginatedInstances;
    const runningInstance = running ? paginatedInstances.filter((a : EC2Instance) => a.state=="running") : regionInstance;
    res.send(runningInstance);
})

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});



