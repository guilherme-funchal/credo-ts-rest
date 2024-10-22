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
const core_1 = require("@aries-framework/core");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const InMemoryStorageService_1 = require("../../../../../tests/InMemoryStorageService");
const tests_1 = require("../../../../core/tests");
const src_1 = require("../../../../indy-sdk/src");
const types_1 = require("../../../../indy-sdk/src/types");
const InMemoryAnonCredsRegistry_1 = require("../../../tests/InMemoryAnonCredsRegistry");
const AnonCredsModule_1 = require("../../AnonCredsModule");
const services_1 = require("../../services");
// Backup date / time is the unique identifier for a backup, needs to be unique for every test
const backupDate = new Date('2023-03-19T22:50:20.522Z');
jest.useFakeTimers().setSystemTime(backupDate);
describe('UpdateAssistant | AnonCreds | v0.3.1 - v0.4', () => {
    it(`should correctly update the credential exchange records for holders`, () => __awaiter(void 0, void 0, void 0, function* () {
        // We need to mock the uuid generation to make sure we generate consistent uuids for the new records created.
        let uuidCounter = 1;
        const uuidSpy = jest.spyOn(core_1.utils, 'uuid').mockImplementation(() => `${uuidCounter++}-4e4f-41d9-94c4-f49351b811f1`);
        const holderRecordsString = (0, fs_1.readFileSync)(path_1.default.join(__dirname, '__fixtures__/holder-anoncreds-2-credentials-0.3.json'), 'utf8');
        const dependencyManager = new core_1.DependencyManager();
        const storageService = new InMemoryStorageService_1.InMemoryStorageService();
        dependencyManager.registerInstance(core_1.InjectionSymbols.StorageService, storageService);
        // If we register the IndySdkModule it will register the storage service, but we use in memory storage here
        dependencyManager.registerContextScoped(core_1.InjectionSymbols.Wallet, src_1.IndySdkWallet);
        dependencyManager.registerInstance(types_1.IndySdkSymbol, tests_1.indySdk);
        dependencyManager.registerInstance(services_1.AnonCredsIssuerServiceSymbol, {});
        dependencyManager.registerInstance(services_1.AnonCredsHolderServiceSymbol, {});
        dependencyManager.registerInstance(services_1.AnonCredsVerifierServiceSymbol, {});
        const agent = new core_1.Agent({
            config: {
                label: 'Test Agent',
                walletConfig: {
                    id: `Wallet: 0.3 Update AnonCreds - Holder`,
                    key: `Key: 0.3 Update AnonCreds - Holder`,
                },
            },
            dependencies: tests_1.agentDependencies,
            modules: {
                // We need to include the AnonCredsModule to run the updates
                anoncreds: new AnonCredsModule_1.AnonCredsModule({
                    registries: [new InMemoryAnonCredsRegistry_1.InMemoryAnonCredsRegistry()],
                }),
            },
        }, dependencyManager);
        const updateAssistant = new core_1.UpdateAssistant(agent, {
            v0_1ToV0_2: {
                mediationRoleUpdateStrategy: 'doNotChange',
            },
        });
        yield updateAssistant.initialize();
        // Set storage after initialization. This mimics as if this wallet
        // is opened as an existing wallet instead of a new wallet
        storageService.records = JSON.parse(holderRecordsString);
        expect(yield updateAssistant.isUpToDate()).toBe(false);
        expect(yield updateAssistant.getNeededUpdates('0.4')).toEqual([
            {
                fromVersion: '0.3.1',
                toVersion: '0.4',
                doUpdate: expect.any(Function),
            },
        ]);
        yield updateAssistant.update();
        expect(yield updateAssistant.isUpToDate()).toBe(true);
        expect(yield updateAssistant.getNeededUpdates()).toEqual([]);
        // MEDIATOR_ROUTING_RECORD recipientKeys will be different every time, and is not what we're testing here
        delete storageService.records.MEDIATOR_ROUTING_RECORD;
        expect(storageService.records).toMatchSnapshot();
        yield agent.shutdown();
        yield agent.wallet.delete();
        uuidSpy.mockReset();
    }));
    it(`should correctly update the schema and credential definition, and create link secret records for issuers`, () => __awaiter(void 0, void 0, void 0, function* () {
        // We need to mock the uuid generation to make sure we generate consistent uuids for the new records created.
        let uuidCounter = 1;
        const uuidSpy = jest.spyOn(core_1.utils, 'uuid').mockImplementation(() => `${uuidCounter++}-4e4f-41d9-94c4-f49351b811f1`);
        const issuerRecordsString = (0, fs_1.readFileSync)(path_1.default.join(__dirname, '__fixtures__/issuer-anoncreds-2-schema-credential-definition-credentials-0.3.json'), 'utf8');
        const dependencyManager = new core_1.DependencyManager();
        const storageService = new InMemoryStorageService_1.InMemoryStorageService();
        dependencyManager.registerInstance(core_1.InjectionSymbols.StorageService, storageService);
        // If we register the IndySdkModule it will register the storage service, but we use in memory storage here
        dependencyManager.registerContextScoped(core_1.InjectionSymbols.Wallet, src_1.IndySdkWallet);
        dependencyManager.registerInstance(types_1.IndySdkSymbol, tests_1.indySdk);
        dependencyManager.registerInstance(services_1.AnonCredsIssuerServiceSymbol, {});
        dependencyManager.registerInstance(services_1.AnonCredsHolderServiceSymbol, {});
        dependencyManager.registerInstance(services_1.AnonCredsVerifierServiceSymbol, {});
        const agent = new core_1.Agent({
            config: {
                label: 'Test Agent',
                walletConfig: {
                    id: `Wallet: 0.3 Update AnonCreds - Issuer`,
                    key: `Key: 0.3 Update AnonCreds - Issuer`,
                },
            },
            dependencies: tests_1.agentDependencies,
            modules: {
                // We need to include the AnonCredsModule to run the updates
                anoncreds: new AnonCredsModule_1.AnonCredsModule({
                    registries: [
                        // We need to be able to resolve the credential definition so we can correctly
                        new InMemoryAnonCredsRegistry_1.InMemoryAnonCredsRegistry({
                            existingCredentialDefinitions: {
                                'did:indy:bcovrin:test:A4CYPASJYRZRt98YWrac3H/anoncreds/v0/CLAIM_DEF/728265/TAG': {
                                    schemaId: 'did:indy:bcovrin:test:A4CYPASJYRZRt98YWrac3H/anoncreds/v0/SCHEMA/Test Schema/5.0',
                                    type: 'CL',
                                    tag: 'TAG',
                                    value: {
                                        primary: {
                                            n: '92212366077388130017820454980772482128748816766820141476572599854614095851660955000471493059368591899172871902601780138917819366396362308478329294184309858890996528496805316851980442998603067852135492500241351106196875782591605768921500179261268030423733287913264566336690041275292095018304899931956463465418485815424864260174164039300668997079647515281912887296402163314193409758676035183692610399804909476026418386307889108672419432084350222061008099663029495600327790438170442656903258282723208685959709427842790363181237326817713760262728130215152068903053780106153722598661062532884431955981726066921637468626277',
                                            s: '51390585781167888666038495435187170763184923351566453067945476469346756595806461020566734704158200027078692575370502193819960413516290740555746465017482403889478846290536023708403164732218491843776868132606601025003681747438312581577370961516850128243993069117644352618102176047630881347535103984514944899145266563740618494984195198066875837169587608421653434298405108448043919659694417868161307274719186874014050768478275366248108923366328095899343801270111152240906954275776825865228792303252410200003812030838965966766135547588341334766187306815530098180130152857685278588510653805870629396608258594629734808653690',
                                            r: {
                                                master_secret: '61760181601132349837705650289020474131050187135887129471275844481815813236212130783118399756778708344638568886652376797607377320325668612002653752234977886335615451602379984880071434500085608574636210148262041392898193694256008614118948399335181637372037261847305940365423773073896368876304671332779131812342778821167205383614143093932646167069176375555949468490333033638790088487176980785886865670928635382374747549737473235069853277820515331625504955674335885563904945632728269515723913822149934246500994026445014344664596837782532383727917670585587931554459150014400148586199456993200824425072825041491149065115358',
                                                name: '26931653629593338073547610164492146524581067674323312766422801723649824593245481234130445257275008372300577748467390938672361842062002005882497002927312107798057743381013725196864084323240188855871993429346248168719358184490582297236588103100736704037766893167139178159330117766371806271005063205199099350905918805615139883380562348264630567225617537443345104841331985857206740142310735949731954114795552226430346325242557801443933408634628778255674180716568613268278944764455783252702248656985033565125477742417595184280107251126994232013125430027211388949790163391384834400043466265407965987657397646084753620067162',
                                                age: '12830581846716232289919923091802380953776468678758115385731032778424701987000173171859986490394782070339145726689704906636521504338663443469452098276346339448054923530423862972901740020260863939784049655599141309168321131841197392728580317478651190091260391159517458959241170623799027865010022955890184958710784660242539198197998462816406524943537217991903198815091955260278449922637325465043293444707204707128649276474679898162587929569212222042385297095967670138838722149998051089657830225229881876437390119475653879155105350339634203813849831587911926503279160004910687478611349149984784835918594248713746244647783',
                                            },
                                            rctxt: '49138795132156579347604024288478735151511429635862925688354411685205551763173458098934068417340097826251030547752551543780926866551808708614689637810970695962341030571486307177314332719168625736959985286432056963760600243473038903885347227651607234887915878119362501367507071709125019506105125043394599512754034429977523734855754182754166158276654375145600716372728023694171066421047665189687655246390105632221713801254689564447819382923248801463300558408016868673087319876644152902663657524012266707505607127264589517707325298805787788577090696580253467312664036297509153665682462337661380935241888630672980409135218',
                                            z: '60039858321231958911193979301402644724013798961769784342413248136534681852773598059805490735235936787666273383388316713664379360735859198156203333524277752965063504355175962212112042368638829236003950022345790744597825843498279654720032726822247321101635671237626308268641767351508666548662103083107416168951088459343716911392807952489009684909391952363633692353090657169830487309162716174148340837088238136793727262599036868196525437496909391247737814314203700293659965465494637540937762691328712617352605531361117679740841379808332881579693119257467828678864789270752346248637901288389165259844857126172669320275054',
                                        },
                                    },
                                    issuerId: 'did:indy:bcovrin:test:A4CYPASJYRZRt98YWrac3H',
                                },
                                'did:indy:bcovrin:test:A4CYPASJYRZRt98YWrac3H/anoncreds/v0/CLAIM_DEF/728266/TAG2222': {
                                    schemaId: 'did:indy:bcovrin:test:A4CYPASJYRZRt98YWrac3H/anoncreds/v0/SCHEMA/AnotherSchema/5.12',
                                    type: 'CL',
                                    tag: 'TAG2222',
                                    value: {
                                        primary: {
                                            n: '92672464557302826159958381706610232890780336783477671819498833000372263812875113518039840314305532823865676182383425212337361529127538393953888294696727490398569250059424479369124987018050461872589017845243006613503064725987487445193151580781503573638936354603906684667833347097853363102011613363551325414493877438329911648643160153986822516630519571283817404410939266429143144325310144873915523634615108054232698216677813083664813055224968248142239446186423096615162232894052206134565411335121805318762068246410255953720296084525738290155785653879950387998340378428740625858243516259978797729172915362664095388670853',
                                            s: '14126994029068124564262196574803727042317991235159231485233854758856355239996741822278406673337232628669751727662479515044513565209261235580848666630891738643990084502393352476512637677170660741636200618878417433799077613673205726221908822955109963272016538705991333626487531499501561952303907487494079241110050020874027756313402672435051524680914533743665605349121374703526870439925807395782970618162620991315112088226807823652545755186406850860290372739405126488851340032404507898084409367889215777693868794728141508635105180827151292046483128114528214465463152927678575672993454367871685772245405671312263615738674',
                                            r: {
                                                master_secret: '26619502892062275386286102324954654427871501074061444846499515284182097331967223335934051936866595058991987589854477281430063143491959604612779394547177027208671151839864660333634457188140162529133121090987235146837242477233778516233683361556079466930407338673047472758762971774183683006400366713364299999136369605402942210978218705656266115751492424192940375368169431001551131077280268253962541139755004287154221749191778445668471756569604156885298127934116907544590473960073154419342138695278066485640775060389330807300193554886282756714343171543381166744147102049996134009291163457413551838522312496539196521595692',
                                                age: '66774168049579501626527407565561158517617240253618394664527561632035323705337586053746273530704030779131642005263474574499533256973752287111528352278167213322154697290967283640418150957238004730763043665983334023181560033670971095508406493073727137576662898702804435263291473328275724172150330235410304531103984478435316648590218258879268883696376276091511367418038567366131461327869666106899795056026111553656932251156588986604454718398629113510266779047268855074155849278155719183039926867214509122089958991364786653941718444527779068428328047815224843863247382688134945397530917090461254004883032104714157971400208',
                                                name: '86741028136853574348723360731891313985090403925160846711944073250686426070668157504590860843944722066104971819518996745252253900749842002049747953678564857190954502037349272982356665401492886602390599170831356482930058593126740772109115907363756874709445041702269262783286817223011097284796236690595266721670997137095592005971209969288260603902458413116126663192645410011918509026240763669966445865557485752253073758758805818980495379553872266089697405986128733558878942127067722757597848458411141451957344742184798866278323991155218917859626726262257431337439505881892995617030558234045945209395337282759265659447047',
                                                height: '36770374391380149834988196363447736840005566975684817148359676140020826239618728242171844190597784913998189387814084045750250841733745991085876913508447852492274928778550079342017977247125002133117906534740912461625630470754160325262589990928728689070499835994964192507742581994860212500470412940278375419595406129858839275229421691764136274418279944569154327695608011398611897919792595046386574831604431186160019573221025054141054966299987505071844770166968281403659227192031982497703452822527121064221030191938050276126255137769594174387744686048921264418842943478063585931864099188919773279516048122408000535396365',
                                            },
                                            rctxt: '71013751275772779114070724661642241189015436101735233481124050655632421295506098157799226697991094582116557937036881377025107827713675564553986787961039221830812177248435167562891351835998258222703796710987072076518659197627933717399137564619646356496210281862112127733957003638837075816198062819168957810762822613691407808469027306413697001991060047213339777833838291591976754857934071589843434238025803790508552421154902537027548698271140571140256835534208651964449214890690159171682094521879102663244464066621388809286987873635426369915309596945084951678722672915158041830248278889303704844284468270547467324686757',
                                            z: '90415953543044389740703639345387867170174070770040351538453902580989033567810029650534915348296084212079064544906463014824475317557221991571331212308335167828473551776349999211544897426382305096215624787217055491736755052175278235595298571339706430785816901931128536495808042995635624112114867111658850659510246291844949806165980806847525704751270260070165853067310918184720602183083989806069386048683955313982129380729637761521928446431397104973906871109766946008926113644488012281655650467201044142029022180536946134328567554182760495139058952910079169456941591963348364521142012653606596379566245637724637892435425',
                                        },
                                        revocation: {
                                            g: '1 1864FF219549D1BC1E492955305FC5EED27C114580F206532D2F5D983A1DD3BD 1 0414758D7B6B254A9CA81E1084721A97CA312497C21BB9B16096636C59F9D105 2 095E45DDF417D05FB10933FFC63D474548B7FFFF7888802F07FFFFFF7D07A8A8',
                                            g_dash: '1 2327DA248E721E3935D81C5579DD3707882FFB962B518D37FB1112D96CC63611 1 164989452135CF5D840A20EE354DBF26BEEC74DE7FD53672E55224BEE0228128 1 0634D5E85C210319BFD2535AFD8F7F79590B2F5CC61AF794218CC50B43FBB8C6 1 0A63F1C0FC2C4540156C7A2E2A2DF1DDF99879C25B4F622933707DD6074A0F1B 2 095E45DDF417D05FB10933FFC63D474548B7FFFF7888802F07FFFFFF7D07A8A8 1 0000000000000000000000000000000000000000000000000000000000000000',
                                            h: '1 0A031B1932CDFEE76C448CA0B13A7DDC81615036DA17B81DB2E5DFC7D1F6CD6F 1 06F46C9CC7D32A11C7D2A308D4C71BEE42B3BD9DD54141284D92D64D3AC2CE04 2 095E45DDF417D05FB10933FFC63D474548B7FFFF7888802F07FFFFFF7D07A8A8',
                                            h0: '1 1C88CA353EF878B74E7F515C88E2CBF11FDC3047E3C5057B34ECC2635B4F8FA5 1 1D645261FBC6164EC493BB700B5D8D5C8BF876FD9BA034B107753C79A53B0321 2 095E45DDF417D05FB10933FFC63D474548B7FFFF7888802F07FFFFFF7D07A8A8',
                                            h1: '1 16AC82FE7769689173EABA532E7A489DF87F81AE891C1FDA90FE9813F6761D71 1 147E45451C76CD3A9B0649B12E27EA0BF4E85E632D1B2BEC3EC9FFFA51780ACE 2 095E45DDF417D05FB10933FFC63D474548B7FFFF7888802F07FFFFFF7D07A8A8',
                                            h2: '1 2522C4FAA35392EE9B35DAC9CD8E270364598A5ED019CB34695E9C01D43C16DC 1 21D353FB299C9E39C976055BF4555198C63F912DBE3471E930185EF5A20470E5 2 095E45DDF417D05FB10933FFC63D474548B7FFFF7888802F07FFFFFF7D07A8A8',
                                            htilde: '1 24D87DBC6283534AE2AA38C45E52D83CC1E70BD589C813F412CC68563F52A2CA 1 05189BC1AAEE8E2A6CB92F65A8C0A18E4125EE61E5CEF1809EF68B388844D1B1 2 095E45DDF417D05FB10933FFC63D474548B7FFFF7888802F07FFFFFF7D07A8A8',
                                            h_cap: '1 1E3272ABDFD9BF05DB5A7667335A48B9026C9EA2C8DB9FA6E59323BBEB955FE2 1 031BD12497C5BBD68BEA2D0D41713CDFFDCBE462D603C54E9CA5F50DE792E1AB 1 05A917EBAA7D4B321E34F37ADC0C3212CE297E67C7D7FEC4E28AD4CE863B7516 1 16780B2C5BF22F7868BF7F442987AF1382F6465A581F6824245EFB90D4BB8B62 2 095E45DDF417D05FB10933FFC63D474548B7FFFF7888802F07FFFFFF7D07A8A8 1 0000000000000000000000000000000000000000000000000000000000000000',
                                            u: '1 1F654067166C73E14C4600C2349F0756763653A0B66F8872D99F9642F3BD2013 1 24B074FFB3EE1E5E7A17A06F4BCB4082478224BD4711619286266B59E3110777 1 001B07BEE5A1E36C0BBC31E56E039B39BB0A1BA2F491C2F674EC5CB89150FC2F 1 0F4F1E71A11EB1215DE5A081B7651E1E22C30FCCC5566E13F0A8062DB67B9E32 2 095E45DDF417D05FB10933FFC63D474548B7FFFF7888802F07FFFFFF7D07A8A8 1 0000000000000000000000000000000000000000000000000000000000000000',
                                            pk: '1 0A165BF9A5546F44298356622C58CA29D2C8D194402CAFCAF5944BE65239474E 1 24BA0620893059732B89897F601F37EF92F9F29B4526E094DA9DC612EB5A90CD 2 095E45DDF417D05FB10933FFC63D474548B7FFFF7888802F07FFFFFF7D07A8A8',
                                            y: '1 020240A177435C7D5B1DBDB78A5F0A34A353447991E670BA09E69CCD03FA6800 1 1501D3C784703A097EDDE368B27B85229030C2942C4874CB913C7AAB8C3EF61A 1 109DB12EF355D8A477E353970300E8C0AC2E48793D3DC13416BFF75145BAD753 1 079C6F242737A5D97AC34CDE4FDE4BEC057A399E73E4EF87E7024048163A005F 2 095E45DDF417D05FB10933FFC63D474548B7FFFF7888802F07FFFFFF7D07A8A8 1 0000000000000000000000000000000000000000000000000000000000000000',
                                        },
                                    },
                                    issuerId: 'did:indy:bcovrin:test:A4CYPASJYRZRt98YWrac3H',
                                },
                            },
                        }),
                    ],
                }),
            },
        }, dependencyManager);
        const updateAssistant = new core_1.UpdateAssistant(agent, {
            v0_1ToV0_2: {
                mediationRoleUpdateStrategy: 'doNotChange',
            },
        });
        yield updateAssistant.initialize();
        // Set storage after initialization. This mimics as if this wallet
        // is opened as an existing wallet instead of a new wallet
        storageService.records = JSON.parse(issuerRecordsString);
        expect(yield updateAssistant.isUpToDate()).toBe(false);
        expect(yield updateAssistant.getNeededUpdates()).toEqual([
            {
                fromVersion: '0.3.1',
                toVersion: '0.4',
                doUpdate: expect.any(Function),
            },
        ]);
        yield updateAssistant.update();
        expect(yield updateAssistant.isUpToDate()).toBe(true);
        expect(yield updateAssistant.getNeededUpdates()).toEqual([]);
        // MEDIATOR_ROUTING_RECORD recipientKeys will be different every time, and is not what we're testing here
        delete storageService.records.MEDIATOR_ROUTING_RECORD;
        expect(storageService.records).toMatchSnapshot();
        yield agent.shutdown();
        yield agent.wallet.delete();
        uuidSpy.mockReset();
    }));
});