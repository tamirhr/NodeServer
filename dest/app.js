"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
//const { authorizeSecret } = require('./auth.ts')
const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/env-file.env` });
const app = (0, express_1.default)();
const port = 3000;
const PAGE_SIZE = 10;
const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");
const secret = process.env.SECRET;
const client = new EC2Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const getInstances = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const command = new DescribeInstancesCommand({ DryRun: false });
        const data = yield client.send(command);
        return parseInstances(data);
    }
    catch (e) {
        console.log(e);
        throw new Error(e.message);
    }
});
const parseInstances = (data) => {
    return data.Reservations.map((reservation) => {
        return reservation.Instances.map((instance) => {
            return {
                name: instance.Tags.find((tag) => tag.Key === "Name").Value,
                ID: instance.InstanceId,
                type: instance.InstanceType,
                state: instance.State.Name,
                region: instance.Placement.AvailabilityZone,
                publicIP: instance.PublicIpAddress,
                privateIPs: instance.PrivateIpAddress,
            };
        });
    }).flat();
};
app.use(express_1.default.json());
//app.use(authorizeSecret(secret));
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(yield getInstances());
}));
app.post('/get', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sort, page } = req.body;
    const instances = yield getInstances();
    console.log(instances);
    const sortedInstances = sort ? instances.sort((a, b) => a[sort] > b[sort] ? 1 : -1) : instances;
    const paginatedInstances = page ? sortedInstances.slice((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE) : sortedInstances.slice(0, PAGE_SIZE);
    res.send(paginatedInstances);
}));
app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
