'use strict'
const SHA256 = require('crypto-js/sha256');
const fs = require('fs');



class Block{
    constructor(timestamp, data, previousHash){
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        }

    calculateHash(){
        return SHA256(this.timestamp + this.previousHash + JSON.stringify(this.data)).toString();
    }
  
}

class Blockchain{
    constructor() {
        this.chain = [];
        let newBlock = new Block("0.0.0", "Genesis block", "0" );
        this.chain.push(newBlock);
    }
     
    getLatestHash(){
        if(this.chain.length == 0){ 
            return "0";
        }
        return this.chain[this.chain.length - 1].hash;
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock){
        if (newBlock.previousHash == this.getLatestHash()){
            this.chain.push(newBlock);
            return true;
        }
        return false;
    }

    isChainValid(){
        for(let i = 1; i<this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.calculateHash()){
                return false;
            }
        }
        return true;
    }

    [Symbol.iterator]() {
        const end = this.chain.length-1;
        let i = 0;
        let blockchain = this.chain;
        const iterator = {
            next() {
                return {
                    value: blockchain[i++],
                    done: i > end
                };
            }
        };
        return iterator;
    }
}

class FileWorker{
    constructor(directory ){
        this.directory = directory;
    }   
        scanDiary(){
            let blocks = [];
            fs.readdirSync(this.directory).forEach(file=>{
                const buffer = fs.readFileSync(this.directory+file, "utf8");
                    let parsedBlock = JSON.parse(buffer.toString());
                    let trueBlok = new Block(parsedBlock.timestamp,parsedBlock.data,parsedBlock.previousHash);
                    blocks.push(trueBlok); 
            })

            let parsedBlockchain = new Blockchain();
            while(blocks.length>1){
                for(const b in blocks){
                    if(parsedBlockchain.addBlock(blocks[b])){
                        blocks.splice(b,1);
                    }       
                }
            }
            return parsedBlockchain;
        }


        writeFile(block){
            const JSON_BLOCK = JSON.stringify(block);
            try{
                fs.writeFileSync(this.directory + block.hash + ".txt", JSON_BLOCK);
                return true;
            }catch(err){
                console.log(err.massage);
            }
            return false;
    } 
}


// Запуск программы 
// Создаем объект дневник
let newDiary = new Blockchain();
console.log("chain ok");
//Создаем объект для работы с файлами
let fw = new FileWorker('/testBlock/');
console.log("fw ok");
//Сканируем блоки в файловой системе
let oldDiary = fw.scanDiary();
console.log("scan ok");
//Выводим полученые из файловой системы блоки
for(const page of oldDiary){
    console.log(page);
}
//Добавляем новый блок с записью о сегодяшнем дне
oldDiary.addBlock(new Block("2019", "Видела в интернете первый снимок черной дыры, красиво", oldDiary.getLatestBlock().hash));

//Записываем дневник в файловую систему
for(const page of oldDiary){
    fw.writeFile(page);
}

//Проверяем целостность
console.log("Целостность дневника: "+oldDiary.isChainValid());

//ОК
console.log('OK');


