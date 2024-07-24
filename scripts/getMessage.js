const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");

const sendShieldedQuery = async (provider, destination, data) => {
    const rpclink = hre.network.config.url;
    const [encryptedData, usedEncryptedKey] = await encryptDataField(
        rpclink,
        data
    );
    const response = await provider.call({
        to: destination,
        data: encryptedData,
    });
    return await decryptNodeResponse(rpclink, response, usedEncryptedKey);
};

async function main() {
    const contractAddress = "0x4F858AE7676cd903779cb4c5D470Be1e18C6D5b2";
    const [signer] = await hre.ethers.getSigners();
    const contractFactory = await hre.ethers.getContractFactory("Swisstronik");
    const contract = contractFactory.attach(contractAddress);
    const functionName = "getMessage";
    const responseMessage = await sendShieldedQuery(
        signer.provider,
        contractAddress,
        contract.interface.encodeFunctionData(functionName)
    );
    console.log(
        "Decoded response:",
        contract.interface.decodeFunctionResult(
            functionName,
            responseMessage
        )[0]
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
