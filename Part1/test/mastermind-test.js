//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const chai = require("chai");
const path = require("path");
const { isTypedArray } = require("util/types");
const wasm_tester = require("circom_tester").wasm;
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);
const assert = chai.assert;
const buildPoseidon = require("circomlibjs").buildPoseidon;

describe("Super Mastermind tests", () => {
    var poseidon;
    var F;

    before(async() => {
        poseidon = await buildPoseidon();
        F = poseidon.F;
    });

    it("Should work when the codebreaker has no hits", async() => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        let salt = 10;
        const guesses = [0, 1, 2, 3, 4];
        const pubSolnHash = poseidon([salt, 5, 6, 7, 0, 1]);
        const bigIntHash = F.toObject(pubSolnHash);

        const INPUT = {
            "pubGuessA": guesses[0],
            "pubGuessB": guesses[1],
            "pubGuessC": guesses[2],
            "pubGuessD": guesses[3],
            "pubGuessE": guesses[4],
            "pubSolnHash": bigIntHash.toString(),
            "pubNumHit": 0,
            "pubNumBlow": 2,
            "privSolnA": 5,
            "privSolnB": 6,
            "privSolnC": 7,
            "privSolnD": 0,
            "privSolnE": 1,
            "privSalt": salt,
        };

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(bigIntHash)));
    });

    it("Should work when the codebreaker guesses the code", async() => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        let salt = 10;
        const guesses = [0, 1, 2, 3, 4];
        const pubSolnHash = poseidon([salt, 0, 1, 2, 3, 4]);
        const bigIntHash = F.toObject(pubSolnHash);

        const INPUT = {
            "pubGuessA": guesses[0],
            "pubGuessB": guesses[1],
            "pubGuessC": guesses[2],
            "pubGuessD": guesses[3],
            "pubGuessE": guesses[4],
            "pubSolnHash": bigIntHash.toString(),
            "pubNumHit": 5,
            "pubNumBlow": 0,
            "privSolnA": guesses[0],
            "privSolnB": guesses[1],
            "privSolnC": guesses[2],
            "privSolnD": guesses[3],
            "privSolnE": guesses[4],
            "privSalt": salt,
        };

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(bigIntHash)));
    });

    it("Should work when the codebreaker has some hits", async() => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        let salt = 10;
        const guesses = [0, 1, 2, 3, 4];
        const pubSolnHash = poseidon([salt, 0, 1, 4, 5, 6]);
        const bigIntHash = F.toObject(pubSolnHash);

        const INPUT = {
            "pubGuessA": guesses[0],
            "pubGuessB": guesses[1],
            "pubGuessC": guesses[2],
            "pubGuessD": guesses[3],
            "pubGuessE": guesses[4],
            "pubSolnHash": bigIntHash.toString(),
            "pubNumHit": 2,
            "pubNumBlow": 1,
            "privSolnA": 0,
            "privSolnB": 1,
            "privSolnC": 4,
            "privSolnD": 5,
            "privSolnE": 6,
            "privSalt": salt,
        };

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(bigIntHash)));
    });
}).timeout(100000000);
