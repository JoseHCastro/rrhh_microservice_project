package com.example.rrhh.proyecto.preplanilla;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
public class BlockchainService {

    private final Web3j web3j;
    private final TransactionManager transactionManager;
    private final String contractAddress;

    public BlockchainService(
            @Value("${BLOCKCHAIN_RPC_URL:https://rpc-amoy.polygon.technology}") String rpcUrl,
            @Value("${BLOCKCHAIN_PRIVATE_KEY:0000000000000000000000000000000000000000000000000000000000000000}") String privateKey,
            @Value("${BLOCKCHAIN_CONTRACT_ADDRESS:0x0000000000000000000000000000000000000000}") String contractAddress,
            @Value("${BLOCKCHAIN_CHAIN_ID:80002}") long chainId) {
        
        log.info("Inicializando Web3j conectado a: {}", rpcUrl);
        this.web3j = Web3j.build(new HttpService(rpcUrl));
        Credentials credentials = Credentials.create(privateKey);
        this.transactionManager = new RawTransactionManager(web3j, credentials, chainId);
        this.contractAddress = contractAddress;
    }

    /**
     * Registra el hash del documento en el Smart Contract y devuelve el hash de la transacción.
     */
    public String registrarHashEnBlockchain(String hashDocumento, Long empleadoId, String periodo) {
        log.info("Iniciando transacción Blockchain para planilla empleado={}, periodo={}", empleadoId, periodo);
        try {
            // Function signature: registrarPlanilla(string,uint256,string)
            Function function = new Function(
                "registrarPlanilla", 
                Arrays.asList(
                    new Utf8String(hashDocumento),
                    new Uint256(BigInteger.valueOf(empleadoId)),
                    new Utf8String(periodo)
                ), 
                Collections.emptyList()
            );

            String encodedFunction = FunctionEncoder.encode(function);
            
            // Obtener precio del gas dinámico
            BigInteger gasPrice = web3j.ethGasPrice().send().getGasPrice();
            BigInteger gasLimit = BigInteger.valueOf(300_000); // Límite de gas estándar para esto

            org.web3j.protocol.core.methods.response.EthSendTransaction ethSendTransaction = transactionManager.sendTransaction(
                gasPrice,
                gasLimit,
                contractAddress,
                encodedFunction,
                BigInteger.ZERO
            );

            if (ethSendTransaction.hasError()) {
                throw new RuntimeException("La transacción Blockchain falló: " + ethSendTransaction.getError().getMessage());
            }

            String txHash = ethSendTransaction.getTransactionHash();
            log.info("Transacción enviada a la red con éxito. TX Hash: {}", txHash);
            return txHash;

        } catch (Exception e) {
            log.error("Error al interactuar con Blockchain: ", e);
            throw new RuntimeException("Error al interactuar con Blockchain", e);
        }
    }

    /**
     * Verifica si el hash de un documento existe en el Smart Contract.
     */
    public boolean verificarHashEnBlockchain(String hashDocumento) {
        log.info("Verificando existencia del hash en Blockchain: {}", hashDocumento);
        try {
            Function function = new Function(
                "verificarPlanilla", 
                Collections.singletonList(new Utf8String(hashDocumento)), 
                Collections.singletonList(new org.web3j.abi.TypeReference<org.web3j.abi.datatypes.Bool>() {})
            );
            String encodedFunction = FunctionEncoder.encode(function);
            
            // Creamos una transacción "eth_call" que no consume gas (solo lectura)
            org.web3j.protocol.core.methods.request.Transaction transaction = 
                org.web3j.protocol.core.methods.request.Transaction.createEthCallTransaction(
                    null, contractAddress, encodedFunction);

            org.web3j.protocol.core.methods.response.EthCall response = web3j.ethCall(
                transaction, org.web3j.protocol.core.DefaultBlockParameterName.LATEST).send();
                
            List<org.web3j.abi.datatypes.Type> results = org.web3j.abi.FunctionReturnDecoder.decode(
                response.getValue(), function.getOutputParameters());
            
            if(results.isEmpty()) {
                log.warn("Blockchain no devolvió resultados al verificar el hash.");
                return false;
            }
            boolean isValid = (Boolean) results.get(0).getValue();
            log.info("Resultado de Blockchain para el hash {}: {}", hashDocumento, isValid);
            return isValid;
        } catch (Exception e) {
            log.error("Error al verificar en Blockchain: ", e);
            return false;
        }
    }
}
