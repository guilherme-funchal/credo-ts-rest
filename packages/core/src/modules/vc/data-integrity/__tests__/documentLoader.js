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
exports.customDocumentLoader = exports.DOCUMENTS = void 0;
const utils_1 = require("../../../../utils");
const did_example_489398593_1 = require("../../__tests__/dids/did_example_489398593");
const did_sov_QqEfJxe752NCmWqR5TssZ5_1 = require("../../__tests__/dids/did_sov_QqEfJxe752NCmWqR5TssZ5");
const did_web_launchpad_1 = require("../../__tests__/dids/did_web_launchpad");
const did_z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL_1 = require("../../__tests__/dids/did_z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL");
const did_z6MkvePyWAApUVeDboZhNbckaWHnqtD6pCETd6xoqGbcpEBV_1 = require("../../__tests__/dids/did_z6MkvePyWAApUVeDboZhNbckaWHnqtD6pCETd6xoqGbcpEBV");
const did_zUC72Q7XD4PE4CrMiDVXuvZng3sBvMmaGgNeTUJuzavH2BS7ThbHL9FhsZM9QYY5fqAQ4MB8M9oudz3tfuaX36Ajr97QRW7LBt6WWmrtESe6Bs5NYzFtLWEmeVtvRYVAgjFcJSa_1 = require("../../__tests__/dids/did_zUC72Q7XD4PE4CrMiDVXuvZng3sBvMmaGgNeTUJuzavH2BS7ThbHL9FhsZM9QYY5fqAQ4MB8M9oudz3tfuaX36Ajr97QRW7LBt6WWmrtESe6Bs5NYzFtLWEmeVtvRYVAgjFcJSa");
const did_zUC72to2eJiFMrt8a89LoaEPHC76QcfAxQdFys3nFGCmDKAmLbdE4ByyQ54kh42XgECCyZfVKe3m41Kk35nzrBKYbk6s9K7EjyLJcGGPkA7N15tDNBQJaY7cHD4RRaTwF6qXpmD_1 = require("../../__tests__/dids/did_zUC72to2eJiFMrt8a89LoaEPHC76QcfAxQdFys3nFGCmDKAmLbdE4ByyQ54kh42XgECCyZfVKe3m41Kk35nzrBKYbk6s9K7EjyLJcGGPkA7N15tDNBQJaY7cHD4RRaTwF6qXpmD");
const did_zUC73JKGpX1WG4CWbFM15ni3faANPet6m8WJ6vaF5xyFsM3MeoBVNgQ6jjVPCcUnTAnJy6RVKqsUXa4AvdRKwV5hhQhwhMWFT9so9jrPekKmqpikTjYBXa3RYWqRpCWHY4u4hxh_1 = require("../../__tests__/dids/did_zUC73JKGpX1WG4CWbFM15ni3faANPet6m8WJ6vaF5xyFsM3MeoBVNgQ6jjVPCcUnTAnJy6RVKqsUXa4AvdRKwV5hhQhwhMWFT9so9jrPekKmqpikTjYBXa3RYWqRpCWHY4u4hxh");
const did_zUC73YqdRJ3t8bZsFUoxYFPNVruHzn4o7u78GSrMXVSkcb3xAYtUxRD2kSt2bDcmQpRjKfygwLJ1HEGfkosSN7gr4acjGkXLbLRXREueknFN4AU19m8BxEgWnLM84CAvsw6bhYn_1 = require("../../__tests__/dids/did_zUC73YqdRJ3t8bZsFUoxYFPNVruHzn4o7u78GSrMXVSkcb3xAYtUxRD2kSt2bDcmQpRjKfygwLJ1HEGfkosSN7gr4acjGkXLbLRXREueknFN4AU19m8BxEgWnLM84CAvsw6bhYn");
const did_zUC74VEqqhEHQcgv4zagSPkqFJxuNWuoBPKjJuHETEUeHLoSqWt92viSsmaWjy82y2cgguc8e9hsGBifnVK67pQ4gve3m6iSboDkmJjxVEb1d6mRAx5fpMAejooNzNqqbTMVeUN_1 = require("../../__tests__/dids/did_zUC74VEqqhEHQcgv4zagSPkqFJxuNWuoBPKjJuHETEUeHLoSqWt92viSsmaWjy82y2cgguc8e9hsGBifnVK67pQ4gve3m6iSboDkmJjxVEb1d6mRAx5fpMAejooNzNqqbTMVeUN");
const did_zUC76qMTDAaupy19pEk8JKH5LJwPwmscNQn24SYpqrgqEoYWPFgCSm4CnTfupADRfbB6CxdwYhVaTFjT4fmPvMh7gWY87LauhaLmNpPamCv4LAepcRfBDndSdtCpZKSTELMjzGJ_1 = require("../../__tests__/dids/did_zUC76qMTDAaupy19pEk8JKH5LJwPwmscNQn24SYpqrgqEoYWPFgCSm4CnTfupADRfbB6CxdwYhVaTFjT4fmPvMh7gWY87LauhaLmNpPamCv4LAepcRfBDndSdtCpZKSTELMjzGJ");
const did_zUC7DMETzdZM6woUjvs2fieEyFTbHABXwBvLYPBs4NDWKut4H41h8V3KTqGNRUziXLYqa1sFYYw9Zjpt6pFUf7hra4Q1zXMA9JjXcXxDpxuDNpUKEpiDPSYYUztVchUJHQJJhox_1 = require("../../__tests__/dids/did_zUC7DMETzdZM6woUjvs2fieEyFTbHABXwBvLYPBs4NDWKut4H41h8V3KTqGNRUziXLYqa1sFYYw9Zjpt6pFUf7hra4Q1zXMA9JjXcXxDpxuDNpUKEpiDPSYYUztVchUJHQJJhox");
const did_zUC7F9Jt6YzVW9fGhwYjVrjdS8Xzg7oQc2CeDcVNgEcEAaJXAtPz3eXu2sewq4xtwRK3DAhQRYwwoYiT3nNzLCPsrKoP72UGZKhh4cNuZD7RkmwzAa1Bye4C5a9DcyYBGKZrE5F_1 = require("../../__tests__/dids/did_zUC7F9Jt6YzVW9fGhwYjVrjdS8Xzg7oQc2CeDcVNgEcEAaJXAtPz3eXu2sewq4xtwRK3DAhQRYwwoYiT3nNzLCPsrKoP72UGZKhh4cNuZD7RkmwzAa1Bye4C5a9DcyYBGKZrE5F");
const did_zUC7H7TxvhWmvfptpu2zSwo5EZ1kr3MPNsjovaD2ipbuzj6zi1vk4FHTiunCJrFvUYV77Mk3QcWUUAHojPZdU8oG476cvMK2ozP1gVq63x5ovj6e4oQ9qg9eF4YjPhWJs6FPuT4_1 = require("../../__tests__/dids/did_zUC7H7TxvhWmvfptpu2zSwo5EZ1kr3MPNsjovaD2ipbuzj6zi1vk4FHTiunCJrFvUYV77Mk3QcWUUAHojPZdU8oG476cvMK2ozP1gVq63x5ovj6e4oQ9qg9eF4YjPhWJs6FPuT4");
const jsonld_1 = __importDefault(require("../libraries/jsonld"));
const contexts_1 = require("./contexts");
const X25519_v1_1 = require("./contexts/X25519_v1");
const citizenship_v1_1 = require("./contexts/citizenship_v1");
const citizenship_v2_1 = require("./contexts/citizenship_v2");
const credentials_v1_1 = require("./contexts/credentials_v1");
const did_v1_1 = require("./contexts/did_v1");
const ed25519_v1_1 = require("./contexts/ed25519_v1");
const mattr_vc_extension_v1_1 = require("./contexts/mattr_vc_extension_v1");
const purl_ob_v3po_1 = require("./contexts/purl_ob_v3po");
const security_v1_1 = require("./contexts/security_v1");
const security_v2_1 = require("./contexts/security_v2");
const security_v3_unstable_1 = require("./contexts/security_v3_unstable");
const vc_revocation_list_2020_1 = require("./contexts/vc_revocation_list_2020");
exports.DOCUMENTS = {
    [did_z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL_1.DID_z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL['id']]: did_z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL_1.DID_z6Mkgg342Ycpuk263R9d8Aq6MUaxPn1DDeHyGo38EefXmgDL,
    [did_z6MkvePyWAApUVeDboZhNbckaWHnqtD6pCETd6xoqGbcpEBV_1.DID_z6MkvePyWAApUVeDboZhNbckaWHnqtD6pCETd6xoqGbcpEBV['id']]: did_z6MkvePyWAApUVeDboZhNbckaWHnqtD6pCETd6xoqGbcpEBV_1.DID_z6MkvePyWAApUVeDboZhNbckaWHnqtD6pCETd6xoqGbcpEBV,
    [did_zUC72Q7XD4PE4CrMiDVXuvZng3sBvMmaGgNeTUJuzavH2BS7ThbHL9FhsZM9QYY5fqAQ4MB8M9oudz3tfuaX36Ajr97QRW7LBt6WWmrtESe6Bs5NYzFtLWEmeVtvRYVAgjFcJSa_1.DID_zUC72Q7XD4PE4CrMiDVXuvZng3sBvMmaGgNeTUJuzavH2BS7ThbHL9FhsZM9QYY5fqAQ4MB8M9oudz3tfuaX36Ajr97QRW7LBt6WWmrtESe6Bs5NYzFtLWEmeVtvRYVAgjFcJSa['id']]: did_zUC72Q7XD4PE4CrMiDVXuvZng3sBvMmaGgNeTUJuzavH2BS7ThbHL9FhsZM9QYY5fqAQ4MB8M9oudz3tfuaX36Ajr97QRW7LBt6WWmrtESe6Bs5NYzFtLWEmeVtvRYVAgjFcJSa_1.DID_zUC72Q7XD4PE4CrMiDVXuvZng3sBvMmaGgNeTUJuzavH2BS7ThbHL9FhsZM9QYY5fqAQ4MB8M9oudz3tfuaX36Ajr97QRW7LBt6WWmrtESe6Bs5NYzFtLWEmeVtvRYVAgjFcJSa,
    [did_example_489398593_1.DID_EXAMPLE_48939859['id']]: did_example_489398593_1.DID_EXAMPLE_48939859,
    [did_zUC73JKGpX1WG4CWbFM15ni3faANPet6m8WJ6vaF5xyFsM3MeoBVNgQ6jjVPCcUnTAnJy6RVKqsUXa4AvdRKwV5hhQhwhMWFT9so9jrPekKmqpikTjYBXa3RYWqRpCWHY4u4hxh_1.DID_zUC73JKGpX1WG4CWbFM15ni3faANPet6m8WJ6vaF5xyFsM3MeoBVNgQ6jjVPCcUnTAnJy6RVKqsUXa4AvdRKwV5hhQhwhMWFT9so9jrPekKmqpikTjYBXa3RYWqRpCWHY4u4hxh['id']]: did_zUC73JKGpX1WG4CWbFM15ni3faANPet6m8WJ6vaF5xyFsM3MeoBVNgQ6jjVPCcUnTAnJy6RVKqsUXa4AvdRKwV5hhQhwhMWFT9so9jrPekKmqpikTjYBXa3RYWqRpCWHY4u4hxh_1.DID_zUC73JKGpX1WG4CWbFM15ni3faANPet6m8WJ6vaF5xyFsM3MeoBVNgQ6jjVPCcUnTAnJy6RVKqsUXa4AvdRKwV5hhQhwhMWFT9so9jrPekKmqpikTjYBXa3RYWqRpCWHY4u4hxh,
    [did_zUC73YqdRJ3t8bZsFUoxYFPNVruHzn4o7u78GSrMXVSkcb3xAYtUxRD2kSt2bDcmQpRjKfygwLJ1HEGfkosSN7gr4acjGkXLbLRXREueknFN4AU19m8BxEgWnLM84CAvsw6bhYn_1.DID_zUC73YqdRJ3t8bZsFUoxYFPNVruHzn4o7u78GSrMXVSkcb3xAYtUxRD2kSt2bDcmQpRjKfygwLJ1HEGfkosSN7gr4acjGkXLbLRXREueknFN4AU19m8BxEgWnLM84CAvsw6bhYn['id']]: did_zUC73YqdRJ3t8bZsFUoxYFPNVruHzn4o7u78GSrMXVSkcb3xAYtUxRD2kSt2bDcmQpRjKfygwLJ1HEGfkosSN7gr4acjGkXLbLRXREueknFN4AU19m8BxEgWnLM84CAvsw6bhYn_1.DID_zUC73YqdRJ3t8bZsFUoxYFPNVruHzn4o7u78GSrMXVSkcb3xAYtUxRD2kSt2bDcmQpRjKfygwLJ1HEGfkosSN7gr4acjGkXLbLRXREueknFN4AU19m8BxEgWnLM84CAvsw6bhYn,
    [did_zUC76qMTDAaupy19pEk8JKH5LJwPwmscNQn24SYpqrgqEoYWPFgCSm4CnTfupADRfbB6CxdwYhVaTFjT4fmPvMh7gWY87LauhaLmNpPamCv4LAepcRfBDndSdtCpZKSTELMjzGJ_1.DID_zUC76qMTDAaupy19pEk8JKH5LJwPwmscNQn24SYpqrgqEoYWPFgCSm4CnTfupADRfbB6CxdwYhVaTFjT4fmPvMh7gWY87LauhaLmNpPamCv4LAepcRfBDndSdtCpZKSTELMjzGJ['id']]: did_zUC76qMTDAaupy19pEk8JKH5LJwPwmscNQn24SYpqrgqEoYWPFgCSm4CnTfupADRfbB6CxdwYhVaTFjT4fmPvMh7gWY87LauhaLmNpPamCv4LAepcRfBDndSdtCpZKSTELMjzGJ_1.DID_zUC76qMTDAaupy19pEk8JKH5LJwPwmscNQn24SYpqrgqEoYWPFgCSm4CnTfupADRfbB6CxdwYhVaTFjT4fmPvMh7gWY87LauhaLmNpPamCv4LAepcRfBDndSdtCpZKSTELMjzGJ,
    [did_zUC7DMETzdZM6woUjvs2fieEyFTbHABXwBvLYPBs4NDWKut4H41h8V3KTqGNRUziXLYqa1sFYYw9Zjpt6pFUf7hra4Q1zXMA9JjXcXxDpxuDNpUKEpiDPSYYUztVchUJHQJJhox_1.DID_zUC7DMETzdZM6woUjvs2fieEyFTbHABXwBvLYPBs4NDWKut4H41h8V3KTqGNRUziXLYqa1sFYYw9Zjpt6pFUf7hra4Q1zXMA9JjXcXxDpxuDNpUKEpiDPSYYUztVchUJHQJJhox['id']]: did_zUC7DMETzdZM6woUjvs2fieEyFTbHABXwBvLYPBs4NDWKut4H41h8V3KTqGNRUziXLYqa1sFYYw9Zjpt6pFUf7hra4Q1zXMA9JjXcXxDpxuDNpUKEpiDPSYYUztVchUJHQJJhox_1.DID_zUC7DMETzdZM6woUjvs2fieEyFTbHABXwBvLYPBs4NDWKut4H41h8V3KTqGNRUziXLYqa1sFYYw9Zjpt6pFUf7hra4Q1zXMA9JjXcXxDpxuDNpUKEpiDPSYYUztVchUJHQJJhox,
    [did_zUC7F9Jt6YzVW9fGhwYjVrjdS8Xzg7oQc2CeDcVNgEcEAaJXAtPz3eXu2sewq4xtwRK3DAhQRYwwoYiT3nNzLCPsrKoP72UGZKhh4cNuZD7RkmwzAa1Bye4C5a9DcyYBGKZrE5F_1.DID_zUC7F9Jt6YzVW9fGhwYjVrjdS8Xzg7oQc2CeDcVNgEcEAaJXAtPz3eXu2sewq4xtwRK3DAhQRYwwoYiT3nNzLCPsrKoP72UGZKhh4cNuZD7RkmwzAa1Bye4C5a9DcyYBGKZrE5F['id']]: did_zUC7F9Jt6YzVW9fGhwYjVrjdS8Xzg7oQc2CeDcVNgEcEAaJXAtPz3eXu2sewq4xtwRK3DAhQRYwwoYiT3nNzLCPsrKoP72UGZKhh4cNuZD7RkmwzAa1Bye4C5a9DcyYBGKZrE5F_1.DID_zUC7F9Jt6YzVW9fGhwYjVrjdS8Xzg7oQc2CeDcVNgEcEAaJXAtPz3eXu2sewq4xtwRK3DAhQRYwwoYiT3nNzLCPsrKoP72UGZKhh4cNuZD7RkmwzAa1Bye4C5a9DcyYBGKZrE5F,
    [did_zUC7H7TxvhWmvfptpu2zSwo5EZ1kr3MPNsjovaD2ipbuzj6zi1vk4FHTiunCJrFvUYV77Mk3QcWUUAHojPZdU8oG476cvMK2ozP1gVq63x5ovj6e4oQ9qg9eF4YjPhWJs6FPuT4_1.DID_zUC7H7TxvhWmvfptpu2zSwo5EZ1kr3MPNsjovaD2ipbuzj6zi1vk4FHTiunCJrFvUYV77Mk3QcWUUAHojPZdU8oG476cvMK2ozP1gVq63x5ovj6e4oQ9qg9eF4YjPhWJs6FPuT4['id']]: did_zUC7H7TxvhWmvfptpu2zSwo5EZ1kr3MPNsjovaD2ipbuzj6zi1vk4FHTiunCJrFvUYV77Mk3QcWUUAHojPZdU8oG476cvMK2ozP1gVq63x5ovj6e4oQ9qg9eF4YjPhWJs6FPuT4_1.DID_zUC7H7TxvhWmvfptpu2zSwo5EZ1kr3MPNsjovaD2ipbuzj6zi1vk4FHTiunCJrFvUYV77Mk3QcWUUAHojPZdU8oG476cvMK2ozP1gVq63x5ovj6e4oQ9qg9eF4YjPhWJs6FPuT4,
    [did_zUC7H7TxvhWmvfptpu2zSwo5EZ1kr3MPNsjovaD2ipbuzj6zi1vk4FHTiunCJrFvUYV77Mk3QcWUUAHojPZdU8oG476cvMK2ozP1gVq63x5ovj6e4oQ9qg9eF4YjPhWJs6FPuT4_1.DID_zUC7H7TxvhWmvfptpu2zSwo5EZ1kr3MPNsjovaD2ipbuzj6zi1vk4FHTiunCJrFvUYV77Mk3QcWUUAHojPZdU8oG476cvMK2ozP1gVq63x5ovj6e4oQ9qg9eF4YjPhWJs6FPuT4['id']]: did_zUC7H7TxvhWmvfptpu2zSwo5EZ1kr3MPNsjovaD2ipbuzj6zi1vk4FHTiunCJrFvUYV77Mk3QcWUUAHojPZdU8oG476cvMK2ozP1gVq63x5ovj6e4oQ9qg9eF4YjPhWJs6FPuT4_1.DID_zUC7H7TxvhWmvfptpu2zSwo5EZ1kr3MPNsjovaD2ipbuzj6zi1vk4FHTiunCJrFvUYV77Mk3QcWUUAHojPZdU8oG476cvMK2ozP1gVq63x5ovj6e4oQ9qg9eF4YjPhWJs6FPuT4,
    [did_zUC72to2eJiFMrt8a89LoaEPHC76QcfAxQdFys3nFGCmDKAmLbdE4ByyQ54kh42XgECCyZfVKe3m41Kk35nzrBKYbk6s9K7EjyLJcGGPkA7N15tDNBQJaY7cHD4RRaTwF6qXpmD_1.DID_zUC72to2eJiFMrt8a89LoaEPHC76QcfAxQdFys3nFGCmDKAmLbdE4ByyQ54kh42XgECCyZfVKe3m41Kk35nzrBKYbk6s9K7EjyLJcGGPkA7N15tDNBQJaY7cHD4RRaTwF6qXpmD['id']]: did_zUC72to2eJiFMrt8a89LoaEPHC76QcfAxQdFys3nFGCmDKAmLbdE4ByyQ54kh42XgECCyZfVKe3m41Kk35nzrBKYbk6s9K7EjyLJcGGPkA7N15tDNBQJaY7cHD4RRaTwF6qXpmD_1.DID_zUC72to2eJiFMrt8a89LoaEPHC76QcfAxQdFys3nFGCmDKAmLbdE4ByyQ54kh42XgECCyZfVKe3m41Kk35nzrBKYbk6s9K7EjyLJcGGPkA7N15tDNBQJaY7cHD4RRaTwF6qXpmD,
    [did_zUC74VEqqhEHQcgv4zagSPkqFJxuNWuoBPKjJuHETEUeHLoSqWt92viSsmaWjy82y2cgguc8e9hsGBifnVK67pQ4gve3m6iSboDkmJjxVEb1d6mRAx5fpMAejooNzNqqbTMVeUN_1.DID_zUC74VEqqhEHQcgv4zagSPkqFJxuNWuoBPKjJuHETEUeHLoSqWt92viSsmaWjy82y2cgguc8e9hsGBifnVK67pQ4gve3m6iSboDkmJjxVEb1d6mRAx5fpMAejooNzNqqbTMVeUN['id']]: did_zUC74VEqqhEHQcgv4zagSPkqFJxuNWuoBPKjJuHETEUeHLoSqWt92viSsmaWjy82y2cgguc8e9hsGBifnVK67pQ4gve3m6iSboDkmJjxVEb1d6mRAx5fpMAejooNzNqqbTMVeUN_1.DID_zUC74VEqqhEHQcgv4zagSPkqFJxuNWuoBPKjJuHETEUeHLoSqWt92viSsmaWjy82y2cgguc8e9hsGBifnVK67pQ4gve3m6iSboDkmJjxVEb1d6mRAx5fpMAejooNzNqqbTMVeUN,
    [did_sov_QqEfJxe752NCmWqR5TssZ5_1.DID_SOV_QqEfJxe752NCmWqR5TssZ5['id']]: did_sov_QqEfJxe752NCmWqR5TssZ5_1.DID_SOV_QqEfJxe752NCmWqR5TssZ5,
    [did_web_launchpad_1.DID_WEB_LAUNCHPAD['id']]: did_web_launchpad_1.DID_WEB_LAUNCHPAD,
    SECURITY_CONTEXT_V1_URL: security_v1_1.SECURITY_V1,
    SECURITY_CONTEXT_V2_URL: security_v2_1.SECURITY_V2,
    SECURITY_CONTEXT_V3_URL: security_v3_unstable_1.SECURITY_V3_UNSTABLE,
    DID_V1_CONTEXT_URL: did_v1_1.DID_V1,
    CREDENTIALS_CONTEXT_V1_URL: credentials_v1_1.CREDENTIALS_V1,
    SECURITY_CONTEXT_BBS_URL: contexts_1.BBS_V1,
    'https://w3id.org/security/suites/bls12381-2020/v1': contexts_1.BBS_V1,
    'https://w3id.org/security/bbs/v1': contexts_1.BBS_V1,
    'https://w3id.org/security/v1': security_v1_1.SECURITY_V1,
    'https://w3id.org/security/v2': security_v2_1.SECURITY_V2,
    'https://w3id.org/security/suites/x25519-2019/v1': X25519_v1_1.X25519_V1,
    'https://w3id.org/security/suites/ed25519-2018/v1': ed25519_v1_1.ED25519_V1,
    'https://www.w3.org/2018/credentials/examples/v1': contexts_1.EXAMPLES_V1,
    'https://www.w3.org/2018/credentials/v1': credentials_v1_1.CREDENTIALS_V1,
    'https://w3id.org/did/v1': did_v1_1.DID_V1,
    'https://www.w3.org/ns/did/v1': did_v1_1.DID_V1,
    'https://w3.org/ns/did/v1': did_v1_1.DID_V1,
    'https://w3id.org/citizenship/v1': citizenship_v1_1.CITIZENSHIP_V1,
    'https://w3id.org/citizenship/v2': citizenship_v2_1.CITIZENSHIP_V2,
    'https://www.w3.org/ns/odrl.jsonld': contexts_1.ODRL,
    'http://schema.org/': contexts_1.SCHEMA_ORG,
    'https://w3id.org/vaccination/v1': contexts_1.VACCINATION_V1,
    'https://w3id.org/vaccination/v2': contexts_1.VACCINATION_V2,
    'https://identity.foundation/presentation-exchange/submission/v1': contexts_1.PRESENTATION_SUBMISSION,
    'https://mattr.global/contexts/vc-extensions/v1': mattr_vc_extension_v1_1.MATTR_VC_EXTENSION_V1,
    'https://purl.imsglobal.org/spec/ob/v3p0/context.json': purl_ob_v3po_1.PURL_OB_V3P0,
    'https://w3c-ccg.github.io/vc-status-rl-2020/contexts/vc-revocation-list-2020/v1.jsonld': vc_revocation_list_2020_1.VC_REVOCATION_LIST_2020,
};
function _customDocumentLoader(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = exports.DOCUMENTS[url];
        if (!result) {
            const withoutFragment = url.split('#')[0];
            result = exports.DOCUMENTS[withoutFragment];
        }
        if (!result) {
            throw new Error(`Document not found: ${url}`);
        }
        if ((0, utils_1.isDid)(url)) {
            result = yield jsonld_1.default.frame(result, {
                '@context': result['@context'],
                '@embed': '@never',
                id: url,
            }, 
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            { documentLoader: this });
        }
        return {
            contextUrl: null,
            documentUrl: url,
            document: result,
        };
    });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const customDocumentLoader = (agentContext) => _customDocumentLoader.bind(_customDocumentLoader);
exports.customDocumentLoader = customDocumentLoader;
