// ========== 宝可梦图鉴 - 应用逻辑 ==========

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

// 缓存
const pokemonCache = new Map();
const speciesCache = new Map();

// 状态
let allPokemon = [];
let filteredPokemon = [];
let currentType = 'all';
let currentSort = 'id';
let displayedCount = 0;
const LOAD_BATCH = 40;
const TOTAL_POKEMON = 1010; // PokeAPI 当前宝可梦总数

// 类型中文映射
const typeCN = {
    normal: '一般', fire: '火', water: '水', electric: '电',
    grass: '草', ice: '冰', fighting: '格斗', poison: '毒',
    ground: '地面', flying: '飞行', psychic: '超能力', bug: '虫',
    rock: '岩石', ghost: '幽灵', dragon: '龙', dark: '恶',
    steel: '钢', fairy: '妖精'
};

// 能力值中文映射
const statCN = {
    hp: 'HP', attack: '攻击', defense: '防御',
    'special-attack': '特攻', 'special-defense': '特防', speed: '速度'
};

// 常用宝可梦中文名称映射（前151 + 热门）
const nameCN = {
    bulbasaur: '妙蛙种子', ivysaur: '妙蛙草', venusaur: '妙蛙花',
    charmander: '小火龙', charmeleon: '火恐龙', charizard: '喷火龙',
    squirtle: '杰尼龟', wartortle: '卡咪龟', blastoise: '水箭龟',
    caterpie: '绿毛虫', metapod: '铁甲蛹', butterfree: '巴大蝶',
    weedle: '独角虫', kakuna: '铁壳蛹', beedrill: '大针蜂',
    pidgey: '波波', pidgeotto: '比比鸟', pidgeot: '大比鸟',
    rattata: '小拉达', raticate: '拉达',
    spearow: '烈雀', fearow: '大嘴雀',
    ekans: '阿柏蛇', arbok: '阿柏怪',
    pikachu: '皮卡丘', raichu: '雷丘',
    sandshrew: '穿山鼠', sandslash: '穿山王',
    'nidoran-f': '尼多兰', nidorina: '尼多娜', nidoqueen: '尼多后',
    'nidoran-m': '尼多朗', nidorino: '尼多力诺', nidoking: '尼多王',
    clefairy: '皮皮', clefable: '皮可西',
    vulpix: '六尾', ninetales: '九尾',
    jigglypuff: '胖丁', wigglytuff: '胖可丁',
    zubat: '超音蝠', golbat: '大嘴蝠',
    oddish: '走路草', gloom: '臭臭花', vileplume: '霸王花',
    paras: '派拉斯', parasect: '派拉斯特',
    venonat: '毛球', venomoth: '摩鲁蛾',
    diglett: '地鼠', dugtrio: '三地鼠',
    meowth: '喵喵', persian: '猫老大',
    psyduck: '可达鸭', golduck: '哥达鸭',
    mankey: '猴怪', primeape: '火爆猴',
    growlithe: '卡蒂狗', arcanine: '风速狗',
    poliwag: '蚊香蝌蚪', poliwhirl: '蚊香君', poliwrath: '蚊香泳士',
    abra: '凯西', kadabra: '勇基拉', alakazam: '胡地',
    machop: '腕力', machoke: '豪力', machamp: '怪力',
    bellsprout: '喇叭芽', weepinbell: '口呆花', victreebel: '大食花',
    tentacool: '玛瑙水母', tentacruel: '毒刺水母',
    geodude: '小拳石', graveler: '隆隆石', golem: '隆隆岩',
    ponyta: '小火马', rapidash: '烈焰马',
    slowpoke: '呆呆兽', slowbro: '呆壳兽',
    magnemite: '小磁怪', magneton: '三合一磁怪',
    farfetchd: '大葱鸭',
    doduo: '嘟嘟', dodrio: '嘟嘟利',
    seel: '小海狮', dewgong: '白海狮',
    grimer: '臭泥', muk: '臭臭泥',
    shellder: '大舌贝', cloyster: '刺甲贝',
    gastly: '鬼斯', haunter: '鬼斯通', gengar: '耿鬼',
    onix: '大岩蛇',
    drowzee: '催眠貘', hypno: '引梦貘人',
    krabby: '大钳蟹', kingler: '巨钳蟹',
    voltorb: '霹雳电球', electrode: '顽皮雷弹',
    exeggcute: '蛋蛋', exeggutor: '椰蛋树',
    cubone: '卡拉卡拉', marowak: '嘎啦嘎啦',
    hitmonlee: '飞腿郎', hitmonchan: '快拳郎',
    lickitung: '大舌头',
    koffing: '瓦斯弹', weezing: '双弹瓦斯',
    rhyhorn: '独角犀牛', rhydon: '钻角犀兽',
    chansey: '吉利蛋',
    tangela: '蔓藤怪',
    kangaskhan: '袋兽',
    horsea: '墨海马', seadra: '海刺龙',
    goldeen: '角金鱼', seaking: '金鱼王',
    staryu: '海星星', starmie: '宝石海星',
    'mr-mime': '魔墙人偶',
    scyther: '飞天螳螂',
    jynx: '迷唇姐',
    electabuzz: '电击兽',
    magmar: '鸭嘴火兽',
    pinsir: '凯罗斯',
    tauros: '肯泰罗',
    magikarp: '鲤鱼王', gyarados: '暴鲤龙',
    lapras: '拉普拉斯',
    ditto: '百变怪',
    eevee: '伊布', vaporeon: '水伊布', jolteon: '雷伊布', flareon: '火伊布',
    porygon: '多边兽',
    omanyte: '菊石兽', omastar: '多刺菊石兽',
    kabuto: '化石盔', kabutops: '镰刀盔',
    aerodactyl: '化石翼龙',
    snorlax: '卡比兽',
    articuno: '急冻鸟', zapdos: '闪电鸟', moltres: '火焰鸟',
    dratini: '迷你龙', dragonair: '哈克龙', dragonite: '快龙',
    mewtwo: '超梦', mew: '梦幻',
    chikorita: '菊草叶', bayleef: '月桂叶', meganium: '大竺葵',
    cyndaquil: '火球鼠', quilava: '火岩鼠', typhlosion: '火暴兽',
    totodile: '小锯鳄', croconaw: '蓝鳄', feraligatr: '大力鳄',
    togepi: '波克比', togetic: '波克基古',
    mareep: '咩利羊', flaaffy: '茸茸羊', ampharos: '电龙',
    marill: '玛力露', azumarill: '玛力露丽',
    sudowoodo: '树才怪',
    wooper: '乌波', quagsire: '沼王',
    espeon: '太阳伊布', umbreon: '月亮伊布',
    murkrow: '黑暗鸦',
    slowking: '呆呆王',
    misdreavus: '梦妖',
    unown: '未知图腾',
    wobbuffet: '果然翁',
    girafarig: '麒麟奇',
    pineco: '榛果球', forretress: '佛烈托斯',
    dunsparce: '土龙弟弟',
    gligar: '天蝎',
    steelix: '大钢蛇',
    snubbull: '布鲁', granbull: '布鲁皇',
    qwilfish: '千针鱼',
    scizor: '巨钳螳螂',
    shuckle: '壶壶',
    heracross: '赫拉克罗斯',
    sneasel: '狃拉',
    teddiursa: '熊宝宝', ursaring: '圈圈熊',
    slugma: '熔岩虫', magcargo: '熔岩蜗牛',
    swinub: '小山猪', piloswine: '长毛猪',
    corsola: '太阳珊瑚',
    remoraid: '铁炮鱼', octillery: '章鱼桶',
    delibird: '信使鸟',
    mantine: '巨翅飞鱼',
    skarmory: '盔甲鸟',
    houndour: '戴鲁比', houndoom: '黑鲁加',
    kingdra: '刺龙王',
    phanpy: '小小象', donphan: '顿甲',
    porygon2: '多边兽Ⅱ',
    stantler: '惊角鹿',
    smeargle: '图图犬',
    tyrogue: '无畏小子', hitmontop: '战舞郎',
    smoochum: '迷唇娃',
    elekid: '电击怪',
    magby: '鸭嘴宝宝',
    miltank: '大奶罐',
    blissey: '幸福蛋',
    raikou: '雷公', entei: '炎帝', suicune: '水君',
    larvitar: '幼基拉斯', pupitar: '沙基拉斯', tyranitar: '班基拉斯',
    lugia: '洛奇亚', 'ho-oh': '凤王',
    celebi: '时拉比',
    treecko: '木守宫', grovyle: '森林蜥蜴', sceptile: '蜥蜴王',
    torchic: '火稚鸡', combusken: '力壮鸡', blaziken: '火焰鸡',
    mudkip: '水跃鱼', marshtomp: '沼跃鱼', swampert: '巨沼怪',
    poochyena: '土狼犬', mightyena: '大狼犬',
    zigzagoon: '蛇纹熊', linoone: '直冲熊',
    wurmple: '刺尾虫', silcoon: '甲壳茧', beautifly: '狩猎凤蝶',
    cascoon: '盾甲茧', dustox: '毒粉蛾',
    lotad: '莲叶童子', lombre: '莲帽小童', ludicolo: '乐天河童',
    seedot: '橡实果', nuzleaf: '长鼻叶', shiftry: '狡猾天狗',
    taillow: '傲骨燕', swellow: '大王燕',
    wingull: '长翅鸥', pelipper: '大嘴鸥',
    ralts: '拉鲁拉丝', kirlia: '奇鲁莉安', gardevoir: '沙奈朵',
    surskit: '溜溜糖球', masquerain: '雨翅蛾',
    shroomish: '蘑蘑菇', breloom: '斗笠菇',
    slakoth: '懒人獭', vigoroth: '过动猿', slaking: '请假王',
    nincada: '土居忍士', ninjask: '铁面忍者', shedinja: '脱壳忍者',
    whismur: '咕妞妞', loudred: '吼爆弹', exploud: '爆音怪',
    makuhita: '幕下力士', hariyama: '铁掌力士',
    azurill: '露力丽',
    nosepass: '朝北鼻',
    skitty: '向尾喵', delcatty: '优雅猫',
    sableye: '勾魂眼',
    mawile: '大嘴娃',
    aron: '可可多拉', lairon: '可多拉', aggron: '波士可多拉',
    meditite: '玛沙那', medicham: '恰雷姆',
    electrike: '落雷兽', manectric: '雷电兽',
    plusle: '正电拍拍',
    minun: '负电拍拍',
    volbeat: '电萤虫', illumise: '甜甜萤',
    roselia: '毒蔷薇',
    gulpin: '溶食兽', swalot: '吞食兽',
    carvanha: '利牙鱼', sharpedo: '巨牙鲨',
    wailmer: '吼吼鲸', wailord: '吼鲸王',
    numel: '呆火驼', camerupt: '喷火驼',
    torkoal: '煤炭龟',
    spoink: '跳跳猪', grumpig: '噗噗猪',
    spinda: '晃晃斑',
    trapinch: '大颚蚁', vibrava: '超音波幼虫', flygon: '沙漠蜻蜓',
    cacnea: '刺球仙人掌', cacturne: '梦歌仙人掌',
    swablu: '青绵鸟', altaria: '七夕青鸟',
    zangoose: '猫鼬斩',
    seviper: '饭匙蛇',
    lunatone: '月石',
    solrock: '太阳岩',
    barboach: '泥泥鳅', whiscash: '鲶鱼王',
    corphish: '龙虾小兵', crawdaunt: '铁螯龙虾',
    baltoy: '天秤偶', claydol: '念力土偶',
    lileep: '触手百合', cradily: '摇篮百合',
    anorith: '太古羽虫', armaldo: '太古盔甲',
    feebas: '丑丑鱼', milotic: '美纳斯',
    castform: '飘浮泡泡',
    kecleon: '变隐龙',
    shuppet: '怨影娃娃', banette: '诅咒娃娃',
    duskull: '夜巡灵', dusclops: '彷徨夜灵',
    tropius: '热带龙',
    chimecho: '风铃铃',
    absol: '阿勃梭鲁',
    wynaut: '小果然',
    snorunt: '雪童子', glalie: '冰鬼护',
    spheal: '海豹球', sealeo: '海魔狮', walrein: '帝牙海狮',
    clamperl: '珍珠贝', huntail: '猎斑鱼', gorebyss: '樱花鱼',
    relicanth: '古空棘鱼',
    luvdisc: '爱心鱼',
    bagon: '宝贝龙', shelgon: '甲壳龙', salamence: '暴飞龙',
    beldum: '铁哑铃', metang: '金属怪', metagross: '巨金怪',
    regirock: '雷吉洛克', regice: '雷吉艾斯', registeel: '雷吉斯奇鲁',
    latias: '拉帝亚斯', latios: '拉帝欧斯',
    kyogre: '盖欧卡', groudon: '固拉多', rayquaza: '烈空坐',
    jirachi: '基拉祈',
    'deoxys-normal': '代欧奇希斯',
    turtwig: '草苗龟', grotle: '树林龟', torterra: '土台龟',
    chimchar: '小火焰猴', monferno: '猛火猴', infernape: '烈焰猴',
    piplup: '波加曼', prinplup: '波皇子', empoleon: '帝王拿波',
    starly: '姆克儿', staravia: '姆克鸟', staraptor: '姆克鹰',
    bidoof: '大牙狸', bibarel: '大尾狸',
    kricketot: '圆法师', kricketune: '音箱蟀',
    shinx: '小猫怪', luxio: '勒克猫', luxray: '伦琴猫',
    budew: '含羞苞', roserade: '罗丝雷朵',
    cranidos: '头盖龙', rampardos: '战槌龙',
    shieldon: '盾甲龙', bastiodon: '护城龙',
    burmy: '结草儿', wormadam: '结草贵妇', mothim: '绅士蛾',
    combee: '三蜜蜂', vespiquen: '蜂女王',
    pachirisu: '帕奇利兹',
    buizel: '泳圈鼬', floatzel: '浮潜鼬',
    cherubi: '樱花宝', cherrim: '樱花儿',
    shellos: '无壳海兔', gastrodon: '海兔兽',
    ambipom: '双尾怪手',
    drifloon: '飘飘球', drifblim: '随风球',
    buneary: '卷卷耳', lopunny: '长耳兔',
    mismagius: '梦妖魔',
    honchkrow: '乌鸦头头',
    glameow: '魅力喵', purugly: '东施喵',
    chingling: '铃铛响',
    stunky: '臭鼬噗', skuntank: '坦克臭鼬',
    bronzor: '铜镜怪', bronzong: '青铜钟',
    bonsly: '盆才怪',
    'mime-jr': '魔尼尼',
    happiny: '小福蛋',
    chatot: '聒噪鸟',
    spiritomb: '花岩怪',
    gible: '圆陆鲨', gabite: '尖牙陆鲨', garchomp: '烈咬陆鲨',
    munchlax: '小卡比兽',
    riolu: '利欧路', lucario: '路卡利欧',
    hippopotas: '沙河马', hippowdon: '河马兽',
    skorupi: '钳尾蝎', drapion: '龙王蝎',
    croagunk: '不良蛙', toxicroak: '毒骷蛙',
    carnivine: '尖牙笼',
    finneon: '荧光鱼', lumineon: '霓虹鱼',
    mantyke: '小球飞鱼',
    snover: '雪笠怪', abomasnow: '暴雪王',
    weavile: '玛狃拉',
    magnezone: '自爆磁怪',
    lickilicky: '大舌舔',
    rhyperior: '超甲狂犀',
    tangrowth: '巨蔓藤',
    electivire: '电击魔兽',
    magmortar: '鸭嘴炎兽',
    togekiss: '波克基斯',
    yanmega: '远古巨蜓',
    leafeon: '叶伊布', glaceon: '冰伊布',
    gliscor: '天蝎王',
    mamoswine: '象牙猪',
    'porygon-z': '多边兽Ｚ',
    gallade: '艾路雷朵',
    probopass: '大朝北鼻',
    dusknoir: '黑夜魔灵',
    froslass: '雪妖女',
    rotom: '洛托姆',
    uxie: '由克希', mesprit: '艾姆利多', azelf: '亚克诺姆',
    dialga: '帝牙卢卡', palkia: '帕路奇亚',
    heatran: '席多蓝恩',
    regigigas: '雷吉奇卡斯',
    'giratina-altered': '骑拉帝纳',
    cresselia: '克雷色利亚',
    phione: '霏欧纳', manaphy: '玛纳霏',
    darkrai: '达克莱伊',
    'shaymin-land': '谢米',
    arceus: '阿尔宙斯',
    victini: '比克提尼',
    snivy: '藤藤蛇', servine: '青藤蛇', serperior: '君主蛇',
    tepig: '暖暖猪', pignite: '炒炒猪', emboar: '炎武王',
    oshawott: '水水獭', dewott: '双刃丸', samurott: '大剑鬼',
    patrat: '探探鼠', watchog: '步哨鼠',
    lillipup: '小约克', herdier: '哈约克', stoutland: '长毛狗',
    purrloin: '扒手猫', liepard: '酷豹',
    pansage: '花椰猴', simisage: '花椰猿',
    pansear: '爆香猴', simisear: '爆香猿',
    panpour: '冷水猴', simipour: '冷水猿',
    munna: '食梦梦', musharna: '梦梦蚀',
    pidove: '豆豆鸽', tranquill: '咕咕鸽', unfezant: '高傲雉鸡',
    blitzle: '斑斑马', zebstrika: '雷电斑马',
    roggenrola: '石丸子', boldore: '地幔岩', gigalith: '庞岩怪',
    woobat: '滚滚蝙蝠', swoobat: '心蝙蝠',
    drilbur: '螺钉地鼠', excadrill: '龙头地鼠',
    audino: '差不多娃娃',
    timburr: '搬运小匠', gurdurr: '铁骨土人', conkeldurr: '修建老匠',
    tympole: '圆蝌蚪', palpitoad: '蓝蟾蜍', seismitoad: '蟾蜍王',
    throh: '投摔鬼', sawk: '打击鬼',
    sewaddle: '虫宝包', swadloon: '宝包茧', leavanny: '保姆虫',
    venipede: '百足蜈蚣', whirlipede: '车轮球', scolipede: '蜈蚣王',
    cottonee: '木棉球', whimsicott: '风妖精',
    petilil: '百合根娃娃', lilligant: '裙儿小姐',
    'basculin-red-striped': '野蛮鲈鱼',
    sandile: '黑眼鳄', krokorok: '混混鳄', krookodile: '流氓鳄',
    darumaka: '火红不倒翁', 'darmanitan-standard': '达摩狒狒',
    maractus: '沙铃仙人掌',
    dwebble: '石居蟹', crustle: '岩殿居蟹',
    scraggy: '滑滑小子', scrafty: '头巾混混',
    sigilyph: '象征鸟',
    yamask: '哭哭面具', cofagrigus: '死神棺',
    tirtouga: '原盖海龟', carracosta: '肋骨海龟',
    archen: '始祖小鸟', archeops: '始祖大鸟',
    trubbish: '破破袋', garbodor: '灰尘山',
    zorua: '索罗亚', zoroark: '索罗亚克',
    minccino: '泡沫栗鼠', cinccino: '奇诺栗鼠',
    gothita: '哥德宝宝', gothorita: '哥德小童', gothitelle: '哥德小姐',
    solosis: '单卵细胞球', duosion: '双卵细胞球', reuniclus: '人造细胞卵',
    ducklett: '鸭宝宝', swanna: '舞天鹅',
    vanillite: '迷你冰', vanillish: '多多冰', vanilluxe: '双倍多多冰',
    deerling: '四季鹿', sawsbuck: '萌芽鹿',
    emolga: '电飞鼠',
    karrablast: '盖盖虫', escavalier: '骑士蜗牛',
    foongus: '哎呀球菇', amoonguss: '败露球菇',
    frillish: '轻飘飘', jellicent: '胖嘟嘟',
    alomomola: '保姆曼波',
    joltik: '电电虫', galvantula: '电蜘蛛',
    ferroseed: '种子铁球', ferrothorn: '坚果哑铃',
    klink: '齿轮儿', klang: '齿轮组', klinklang: '齿轮怪',
    tynamo: '麻麻小鱼', eelektrik: '麻麻鳗', eelektross: '麻麻鳗鱼王',
    elgyem: '小灰怪', beheeyem: '大宇怪',
    litwick: '烛光灵', lampent: '灯火幽灵', chandelure: '水晶灯火灵',
    axew: '牙牙', fraxure: '斧牙龙', haxorus: '双斧战龙',
    cubchoo: '喷嚏熊', beartic: '冻原熊',
    cryogonal: '几何雪花',
    shelmet: '小嘴蜗', accelgor: '敏捷虫',
    stunfisk: '泥巴鱼',
    mienfoo: '功夫鼬', mienshao: '师父鼬',
    druddigon: '赤面龙',
    golett: '泥偶小人', golurk: '泥偶巨人',
    pawniard: '驹刀小兵', bisharp: '劈斩司令',
    bouffalant: '爆炸头水牛',
    rufflet: '毛头小鹰', braviary: '勇士雄鹰',
    vullaby: '秃鹰丫头', mandibuzz: '秃鹰娜',
    heatmor: '熔蚁兽',
    durant: '铁蚁',
    deino: '单首龙', zweilous: '双首暴龙', hydreigon: '三首恶龙',
    larvesta: '燃烧虫', volcarona: '火神蛾',
    cobalion: '勾帕路翁', terrakion: '代拉基翁', virizion: '毕力吉翁',
    tornadus: '龙卷云', thundurus: '雷电云',
    reshiram: '莱希拉姆', zekrom: '捷克罗姆',
    landorus: '土地云',
    kyurem: '酋雷姆',
    keldeo: '凯路迪欧',
    meloetta: '美洛耶塔',
    genesect: '盖诺赛克特',
    chespin: '哈力栗', quilladin: '胖胖哈力', chesnaught: '布里卡隆',
    fennekin: '火狐狸', braixen: '长尾火狐', delphox: '妖火红狐',
    froakie: '呱呱泡蛙', frogadier: '呱头蛙', greninja: '甲贺忍蛙',
    bunnelby: '掘掘兔', diggersby: '掘地兔',
    fletchling: '小箭雀', fletchinder: '火箭雀', talonflame: '烈箭鹰',
    scatterbug: '粉蝶虫', spewpa: '粉蝶蛹', vivillon: '彩粉蝶',
    litleo: '小狮狮', pyroar: '火炎狮',
    flabebe: '花蓓蓓', floette: '花叶蒂', florges: '花洁夫人',
    skiddo: '坐骑小羊', gogoat: '坐骑山羊',
    pancham: '顽皮熊猫', pangoro: '流氓熊猫',
    furfrou: '多丽米亚',
    espurr: '妙喵', 'meowstic-male': '超能妙喵',
    honedge: '独剑鞘', doublade: '双剑鞘', aegislash: '坚盾剑怪',
    spritzee: '粉香香', aromatisse: '芳香精',
    swirlix: '绵绵泡芙', slurpuff: '胖甜妮',
    inkay: '好啦鱿', malamar: '乌贼王',
    binacle: '龟脚脚', barbaracle: '龟足巨铠',
    skrelp: '垃垃藻', dragalge: '毒藻龙',
    clauncher: '铁臂枪虾', clawitzer: '钢炮臂虾',
    helioptile: '伞电蜥', heliolisk: '光电伞蜥',
    tyrunt: '宝宝暴龙', tyrantrum: '怪颚龙',
    amaura: '冰雪龙', aurorus: '冰雪巨龙',
    sylveon: '仙子伊布',
    hawlucha: '摔角鹰人',
    dedenne: '咚咚鼠',
    carbink: '小碎钻',
    goomy: '黏黏宝', sliggoo: '黏美儿', goodra: '黏美龙',
    klefki: '钥圈儿',
    phantump: '小木灵', trevenant: '朽木妖',
    'pumpkaboo-average': '南瓜精', 'gourgeist-average': '南瓜怪人',
    bergmite: '冰宝', avalugg: '冰岩怪',
    noibat: '嗡蝠', noivern: '音波龙',
    xerneas: '哲尔尼亚斯', yveltal: '伊裴尔塔尔',
    'zygarde-50': '基格尔德',
    diancie: '蒂安希',
    hoopa: '胡帕',
    volcanion: '波尔凯尼恩',
    rowlet: '木木枭', dartrix: '投羽枭', decidueye: '狙射树枭',
    litten: '火斑喵', torracat: '炎热喵', incineroar: '炽焰咆哮虎',
    popplio: '球球海狮', brionne: '花漾海狮', primarina: '西狮海壬',
    pikipek: '小笃儿', trumbeak: '喇叭啄鸟', toucannon: '铳嘴大鸟',
    yungoos: '猫鼬少', gumshoos: '猫鼬探长',
    grubbin: '强颚鸡母虫', charjabug: '虫电宝', vikavolt: '锹农炮虫',
    crabrawler: '好胜蟹', crabominable: '好胜毛蟹',
    oricorio: '花舞鸟',
    cutiefly: '萌虻', ribombee: '蝶结萌虻',
    rockruff: '岩狗狗', 'lycanroc-midday': '鬃岩狼人',
    wishiwashi: '弱丁鱼',
    mareanie: '好坏星', toxapex: '超坏星',
    mudbray: '泥驴仔', mudsdale: '重泥挽马',
    dewpider: '滴蛛', araquanid: '滴蛛霸',
    fomantis: '伪螳草', lurantis: '兰螳花',
    morelull: '睡睡菇', shiinotic: '灯罩夜菇',
    salandit: '夜盗火蜥', salazzle: '焰后蜥',
    stufful: '童偶熊', bewear: '穿着熊',
    bounsweet: '甜竹竹', steenee: '甜舞妮', tsareena: '甜冷美后',
    comfey: '花疗环环',
    oranguru: '智挥猩',
    passimian: '投掷猴',
    wimpod: '胆小虫', golisopod: '具甲武者',
    sandygast: '沙丘娃', palossand: '噬沙堡爷',
    pyukumuku: '拳海参',
    'type-null': '属性：空', silvally: '银伴战兽',
    'minior-red-meteor': '小陨星',
    komala: '树枕尾熊',
    turtonator: '爆焰龟兽',
    togedemaru: '托戈德玛尔',
    mimikyu: '谜拟Ｑ',
    bruxish: '磨牙彩皮鱼',
    drampa: '老翁龙',
    dhelmise: '破破舵轮',
    'jangmo-o': '心鳞宝', 'hakamo-o': '鳞甲龙', 'kommo-o': '杖尾鳞甲龙',
    'tapu-koko': '卡璞・鸣鸣', 'tapu-lele': '卡璞・蝶蝶',
    'tapu-bulu': '卡璞・哞哞', 'tapu-fini': '卡璞・鳍鳍',
    cosmog: '科斯莫古', cosmoem: '科斯莫姆',
    solgaleo: '索尔迦雷欧', lunala: '露奈雅拉',
    nihilego: '虚吾伊德', buzzwole: '爆肌蚊', pheromosa: '费洛美螂',
    xurkitree: '电束木', celesteela: '铁火辉夜', kartana: '纸御剑',
    guzzlord: '恶食大王',
    necrozma: '奈克洛兹玛',
    magearna: '玛机雅娜',
    marshadow: '玛夏多',
    poipole: '毒贝比', naganadel: '四颚针龙',
    stakataka: '垒磊石', blacephalon: '砰头小丑',
    zeraora: '捷拉奥拉',
    meltan: '美录坦', melmetal: '美录梅塔',
    grookey: '敲音猴', thwackey: '啪咚猴', rillaboom: '轰擂金刚猩',
    scorbunny: '炎兔儿', raboot: '腾蹴小将', cinderace: '闪焰王牌',
    sobble: '泪眼蜥', drizzile: '变涩蜥', inteleon: '千面避役',
    skwovet: '贪心栗鼠', greedent: '藏饱栗鼠',
    rookidee: '稚山雀', corvisquire: '蓝鸦', corviknight: '钢铠鸦',
    blipbug: '索侦虫', dottler: '天罩虫', orbeetle: '以欧路普',
    nickit: '狡小狐', thievul: '猾大狐',
    gossifleur: '幼棉棉', eldegoss: '白蓬蓬',
    wooloo: '毛辫羊', dubwool: '毛毛角羊',
    chewtle: '咬咬龟', drednaw: '暴噬龟',
    yamper: '来电汪', boltund: '逐电犬',
    rolycoly: '小炭仔', carkol: '大炭车', coalossal: '巨炭山',
    applin: '啃果虫', flapple: '苹裹龙', appletun: '丰蜜龙',
    silicobra: '沙包蛇', sandaconda: '沙螺蟒',
    cramorant: '古月鸟',
    arrokuda: '刺梭鱼', barraskewda: '戽斗尖梭',
    toxel: '毒电婴', 'toxtricity-amped': '颤弦蝾螈',
    sizzlipede: '烧火蚣', centiskorch: '焚焰蚣',
    clobbopus: '拳拳蛸', grapploct: '八爪武师',
    sinistea: '来悲茶', polteageist: '怖思壶',
    hatenna: '迷布莉姆', hattrem: '提布莉姆', hatterene: '布莉姆温',
    impidimp: '捣蛋小妖', morgrem: '诈唬魔', grimmsnarl: '长毛巨魔',
    obstagoon: '堵拦熊',
    perrserker: '喵头目',
    cursola: '魔灵珊瑚',
    sirfetchd: '葱游兵',
    'mr-rime': '踏冰人偶',
    runerigus: '死神板',
    milcery: '小仙奶', alcremie: '霜奶仙',
    falinks: '列阵兵',
    pincurchin: '啪嚓海胆',
    snom: '雪吞虫', frosmoth: '雪绒蛾',
    stonjourner: '巨石丁',
    eiscue: '冰砌鹅',
    indeedee: '爱管侍',
    'morpeko-full-belly': '莫鲁贝可',
    cufant: '铜象', copperajah: '大王铜象',
    dracozolt: '雷鸟龙', arctozolt: '雷鸟海兽',
    dracovish: '鳃鱼龙', arctovish: '鳃鱼海兽',
    duraludon: '铝钢龙',
    dreepy: '多龙梅西亚', drakloak: '多龙奇', dragapult: '多龙巴鲁托',
    zacian: '苍响', zamazenta: '藏玛然特',
    eternatus: '无极汰那',
    kubfu: '熊徒弟', 'urshifu-single-strike': '武道熊师',
    zarude: '萨戮德',
    regieleki: '雷吉艾勒奇', regidrago: '雷吉铎拉戈',
    glastrier: '雪暴马', spectrier: '灵幽马',
    calyrex: '蕾冠王',
    wyrdeer: '诡角鹿',
    kleavor: '劈斧螳螂',
    ursaluna: '月月熊',
    'basculegion-male': '幽尾玄鱼',
    sneasler: '大狃拉',
    overqwil: '万针鱼',
    'enamorus-incarnate': '眷恋云',
    sprigatito: '新叶喵', floragato: '蒂蕾喵', meowscarada: '魔幻假面喵',
    fuecoco: '呆火鳄', crocalor: '炙烫鳄', skeledirge: '骨纹巨声鳄',
    quaxly: '润水鸭', quaxwell: '涌跃鸭', quaquaval: '狂欢浪舞鸭',
    lechonk: '爱吃豚', oinkologne: '飘香豚',
    tarountula: '团珠蛛', spidops: '操陷蛛',
    nymble: '豆蟋蟀', lokix: '烈腿蝗',
    pawmi: '布拨', pawmo: '布土拨', pawmot: '巴布土拨',
    tandemaus: '一对鼠', maushold: '一家鼠',
    fidough: '狗仔包', dachsbun: '麻花犬',
    smoliv: '迷你芙', dolliv: '奥利纽', arboliva: '奥利瓦',
    squawkabilly: '怒鹦哥',
    nacli: '盐石宝', naclstack: '盐石垒', garganacl: '盐石巨灵',
    charcadet: '炭小侍', armarouge: '红莲铠骑', ceruledge: '苍炎刃鬼',
    tadbulb: '光蚪仔', bellibolt: '电肚蛙',
    wattrel: '电海燕', kilowattrel: '大电海燕',
    maschiff: '偶叫獒', mabosstiff: '獒教父',
    shroodle: '滋汁鼹', grafaiai: '涂标客',
    bramblin: '纳噬草', brambleghast: '怖纳噬草',
    toedscool: '原野水母', toedscruel: '陆地水母',
    klawf: '毛崖蟹',
    capsakid: '热辣娃', scovillain: '狠辣椒',
    rellor: '虫滚泥', rabsca: '虫甲圣',
    flittle: '飘飘雏', espathra: '超能艳鸵',
    tinkatink: '小锻匠', tinkatuff: '巧锻匠', tinkaton: '巨锻匠',
    wiglett: '海地鼠', wugtrio: '三海地鼠',
    bombirdier: '下石鸟',
    finizen: '波普海豚', palafin: '海豚侠',
    varoom: '噗隆隆', revavroom: '普隆隆姆',
    cyclizar: '摩托蜥',
    orthworm: '拖拖蚓',
    glimmet: '晶光芽', glimmora: '晶光花',
    greavard: '墓仔狗', houndstone: '墓扬犬',
    flamigo: '缠红鹤',
    cetoddle: '走鲸', cetitan: '浩大鲸',
    veluza: '轻身鳕',
    dondozo: '吃吼霸',
    tatsugiri: '米立龙',
    annihilape: '弃世猴',
    clodsire: '土王',
    farigiraf: '奇麒麟',
    dudunsparce: '土龙节节',
    kingambit: '仆刀将军',
    'great-tusk': '雄伟牙', 'scream-tail': '吼叫尾',
    'brute-bonnet': '猛恶菇', 'flutter-mane': '振翼发',
    'slither-wing': '爬地翅', 'sandy-shocks': '沙铁皮',
    'iron-treads': '铁辙迹', 'iron-bundle': '铁包袱',
    'iron-hands': '铁臂膀', 'iron-jugulis': '铁脖颈',
    'iron-moth': '铁毒蛾', 'iron-thorns': '铁荆棘',
    frigibax: '凉脊龙', arctibax: '冻脊龙', baxcalibur: '戟脊龙',
    gholdengo: '赛富豪',
    'wo-chien': '古简蜗', 'chien-pao': '古剑豹',
    'ting-lu': '古鼎鹿', 'chi-yu': '古玉鱼',
    'roaring-moon': '轰鸣月', 'iron-valiant': '铁武者',
    koraidon: '故勒顿', miraidon: '密勒顿',
    'walking-wake': '波荡水', 'iron-leaves': '铁斑叶',
    dipplin: '裹蜜虫', poltchageist: '斯魔茶', sinistcha: '来悲粗茶',
    okidogi: '够赞狗', munkidori: '愿增猿', fezandipiti: '吉雉鸡',
    ogerpon: '厄诡椪',
    archaludon: '铝钢桥龙',
    hydrapple: '蜜集大蛇',
    gougingfire: '破空焰', ragebolt: '猛雷鼓',
    ironboulder: '铁磐岩', ironcrown: '铁头壳',
    terapagos: '太乐巴戈斯',
    pecharunt: '桃歹郎',
};

// ========== DOM 元素 ==========
const $grid = document.getElementById('pokemonGrid');
const $loading = document.getElementById('loading');
const $loadMore = document.getElementById('loadMoreContainer');
const $loadMoreBtn = document.getElementById('loadMoreBtn');
const $searchInput = document.getElementById('searchInput');
const $clearSearch = document.getElementById('clearSearch');
const $modalOverlay = document.getElementById('modalOverlay');
const $modalContent = document.getElementById('modalContent');
const $modalClose = document.getElementById('modalClose');
const $backToTop = document.getElementById('backToTop');
const $totalCount = document.getElementById('totalCount');
const $typeFilters = document.querySelector('.type-filters');
const $sortRadios = document.querySelectorAll('input[name="sort"]');

// ========== 初始化 ==========
async function init() {
    showLoading(true);
    await loadPokemonList();
    applyFilters();
    showLoading(false);
    $loadMore.classList.remove('hidden');
    $totalCount.textContent = `共 ${allPokemon.length} 只宝可梦`;
}

// ========== 加载宝可梦列表 ==========
async function loadPokemonList() {
    try {
        // 一次性获取所有宝可梦的基础列表
        const resp = await fetch(`${POKEAPI_BASE}/pokemon?limit=${TOTAL_POKEMON}&offset=0`);
        const data = await resp.json();
        allPokemon = data.results.map((p, i) => ({
            id: i + 1,
            name: p.name,
            url: p.url,
        }));
        $totalCount.textContent = `共 ${allPokemon.length} 只宝可梦`;
    } catch (err) {
        console.error('加载宝可梦列表失败:', err);
        $grid.innerHTML = '<div class="empty-state"><p>加载失败，请检查网络后刷新页面</p></div>';
    }
}

// ========== 获取宝可梦详情（带缓存） ==========
async function getPokemonDetail(idOrUrl) {
    const url = typeof idOrUrl === 'number'
        ? `${POKEAPI_BASE}/pokemon/${idOrUrl}`
        : idOrUrl;

    if (pokemonCache.has(url)) {
        return pokemonCache.get(url);
    }

    try {
        const resp = await fetch(url);
        if (!resp.ok) return null;
        const data = await resp.json();
        pokemonCache.set(url, data);
        return data;
    } catch {
        return null;
    }
}

// ========== 获取物种信息（带缓存） ==========
async function getSpecies(url) {
    if (speciesCache.has(url)) return speciesCache.get(url);
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        speciesCache.set(url, data);
        return data;
    } catch {
        return null;
    }
}

// ========== 获取中文名 ==========
function getChineseName(name) {
    if (nameCN[name]) return nameCN[name];
    // 尝试用 species API 获取中文名
    return '';
}

// ========== 显示宝可梦卡片 ==========
async function displayPokemon(pokemonList) {
    // 只显示当前批次
    const batch = pokemonList.slice(displayedCount, displayedCount + LOAD_BATCH);
    if (batch.length === 0) {
        $loadMore.classList.add('hidden');
        return;
    }

    showLoading(true);

    const pokemonDataList = await Promise.all(
        batch.map(async (p) => {
            const detail = await getPokemonDetail(p.url);
            if (!detail) return null;

            const species = detail.species ? await getSpecies(detail.species.url) : null;
            let cnName = getChineseName(detail.name);

            // 如果没有本地映射，尝试从 species API 获取
            if (!cnName && species) {
                const cnEntry = species.names?.find(n => n.language.name === 'zh-Hans' || n.language.name === 'zh-Hant' || n.language.name === 'zh-CN');
                if (cnEntry) cnName = cnEntry.name;
            }

            return {
                id: detail.id,
                name: detail.name,
                cnName: cnName || '',
                image: detail.sprites?.other?.['official-artwork']?.front_default
                    || detail.sprites?.front_default
                    || '',
                types: detail.types.map(t => t.type.name),
            };
        })
    );

    // 过滤掉失败的
    const validData = pokemonDataList.filter(Boolean);

    // 渲染卡片
    validData.forEach(p => {
        const card = createPokemonCard(p);
        $grid.appendChild(card);
    });

    displayedCount += batch.length;
    showLoading(false);

    // 如果全部加载完毕，隐藏按钮
    if (displayedCount >= pokemonList.length) {
        $loadMore.classList.add('hidden');
    }
}

// ========== 创建宝可梦卡片 ==========
function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    card.dataset.id = pokemon.id;
    card.innerHTML = `
        <div class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</div>
        <div class="pokemon-img-container">
            <img class="pokemon-img" src="${pokemon.image}" alt="${pokemon.name}" loading="lazy">
        </div>
        <div class="pokemon-name">${pokemon.name}</div>
        ${pokemon.cnName ? `<div class="pokemon-name-cn">${pokemon.cnName}</div>` : ''}
        <div class="pokemon-types">
            ${pokemon.types.map(t => `<span class="type-badge ${t}">${typeCN[t] || t}</span>`).join('')}
        </div>
    `;
    card.addEventListener('click', () => openModal(pokemon.id));
    return card;
}

// ========== 筛选和排序 ==========
function applyFilters() {
    const query = $searchInput.value.toLowerCase().trim();
    let result = [...allPokemon];

    // 按类型筛选
    if (currentType !== 'all') {
        // 按类型筛选需要先加载数据，这里做延迟筛选
        // 实际在 loadMore 时再做筛选
    }

    // 按搜索筛选
    if (query) {
        result = result.filter(p => {
            const cnName = nameCN[p.name] || '';
            return p.name.includes(query)
                || String(p.id).includes(query)
                || cnName.includes(query);
        });
    }

    // 排序
    if (currentSort === 'name') {
        result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        result.sort((a, b) => a.id - b.id);
    }

    filteredPokemon = result;

    // 按类型做进一步筛选
    if (currentType !== 'all') {
        // 按类型：只保留 ID 初始范围（用分页方式处理）
        displayTypeFiltered(result);
    } else {
        $grid.innerHTML = '';
        displayedCount = 0;
        displayPokemon(result);
    }
}

// ========== 按类型筛选展示 ==========
async function displayTypeFiltered(pokemonList) {
    $grid.innerHTML = '';
    displayedCount = 0;
    showLoading(true);

    // 获取该类型的所有宝可梦 ID
    try {
        const typeResp = await fetch(`${POKEAPI_BASE}/type/${currentType}`);
        const typeData = await typeResp.json();
        const typePokemonIds = new Set(
            typeData.pokemon.map(p => {
                const urlParts = p.pokemon.url.split('/');
                return parseInt(urlParts[urlParts.length - 2]);
            })
        );

        const typeFiltered = pokemonList.filter(p => typePokemonIds.has(p.id));
        filteredPokemon = typeFiltered;
        $totalCount.textContent = `共 ${typeFiltered.length} 只 ${typeCN[currentType]}系宝可梦`;

        showLoading(false);
        if (typeFiltered.length > 0) {
            displayPokemon(typeFiltered);
        } else {
            $grid.innerHTML = '<div class="empty-state"><p>没有找到符合条件的宝可梦</p></div>';
            $loadMore.classList.add('hidden');
        }
    } catch {
        showLoading(false);
        $grid.innerHTML = '<div class="empty-state"><p>筛选失败，请稍后重试</p></div>';
    }
}

// ========== 弹窗 - 打开详情 ==========
async function openModal(id) {
    $modalOverlay.classList.add('active');
    $modalContent.innerHTML = '<div class="loading"><div class="pokeball-loader"></div><p>加载中...</p></div>';
    document.body.style.overflow = 'hidden';

    try {
        const detail = await getPokemonDetail(id);
        if (!detail) throw new Error('Not found');

        const species = detail.species ? await getSpecies(detail.species.url) : null;
        const cnName = getChineseName(detail.name) || '';

        // 获取中文描述
        let description = '';
        if (species) {
            const zhEntry = species.flavor_text_entries?.find(
                e => e.language.name === 'zh-Hans' || e.language.name === 'zh-Hant'
            );
            if (zhEntry) {
                description = zhEntry.flavor_text.replace(/[\n\f]/g, ' ');
            }
        }

        // 获取进化链
        let evolutionHtml = '';
        if (species?.evolution_chain?.url) {
            evolutionHtml = await getEvolutionChainHTML(species.evolution_chain.url);
        }

        const mainType = detail.types[0].type.name;
        const totalStats = detail.stats.reduce((s, st) => s + st.base_stat, 0);

        // 获取特性中文名
        const speciesCN = typeCN[mainType] || mainType;

        $modalContent.innerHTML = `
            <div class="modal-header ${mainType}">
                <div class="modal-pokemon-id">#${String(detail.id).padStart(3, '0')}</div>
                <img class="pokemon-img-large"
                     src="${detail.sprites?.other?.['official-artwork']?.front_default || detail.sprites?.front_default || ''}"
                     alt="${detail.name}">
                <div class="modal-pokemon-name">
                    ${detail.name}
                    ${cnName ? `<span style="font-size:0.7em;opacity:0.8;margin-left:6px;">${cnName}</span>` : ''}
                </div>
                <div class="modal-types">
                    ${detail.types.map(t => `<span class="type-badge ${t.type.name}">${typeCN[t.type.name] || t.type.name}</span>`).join('')}
                </div>
            </div>
            <div class="modal-body">
                ${description ? `<p style="color:#718096;margin-bottom:20px;font-size:0.9rem;line-height:1.7;">${description}</p>` : ''}

                <h3>📋 基本信息</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">身高</div>
                        <div class="value">${(detail.height / 10).toFixed(1)} m</div>
                    </div>
                    <div class="info-item">
                        <div class="label">体重</div>
                        <div class="value">${(detail.weight / 10).toFixed(1)} kg</div>
                    </div>
                    <div class="info-item">
                        <div class="label">属性</div>
                        <div class="value">${speciesCN}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">种族值总和</div>
                        <div class="value">${totalStats}</div>
                    </div>
                </div>

                <h3>📊 能力值</h3>
                <div class="stats-section">
                    ${detail.stats.map(s => {
                        const percent = Math.min((s.base_stat / 255) * 100, 100);
                        const color = percent > 60 ? '#48bb78' : percent > 35 ? '#ecc94b' : '#fc8181';
                        return `
                            <div class="stat-row">
                                <span class="stat-name">${statCN[s.stat.name] || s.stat.name}</span>
                                <div class="stat-bar-bg">
                                    <div class="stat-bar-fill" style="width:${percent}%;background:${color};"></div>
                                </div>
                                <span class="stat-value">${s.base_stat}</span>
                            </div>
                        `;
                    }).join('')}
                </div>

                <h3>⚡ 特性</h3>
                <div class="abilities-section">
                    ${detail.abilities.map(a => {
                        const isHidden = a.is_hidden ? ' hidden-ability' : '';
                        return `<span class="ability-tag${isHidden}">${a.ability.name.replace('-', ' ')}</span>`;
                    }).join('')}
                </div>

                ${evolutionHtml ? `
                    <h3>🔄 进化链</h3>
                    <div class="evolution-chain">${evolutionHtml}</div>
                ` : ''}
            </div>
        `;
    } catch (err) {
        console.error('加载详情失败:', err);
        $modalContent.innerHTML = '<div class="loading"><p>加载失败，请稍后重试</p></div>';
    }
}

// ========== 获取进化链 HTML ==========
async function getEvolutionChainHTML(chainUrl) {
    try {
        const resp = await fetch(chainUrl);
        const data = await resp.json();

        const evoIds = [];

        function extractChain(chain) {
            if (!chain) return;
            const id = parseInt(chain.species.url.split('/').filter(Boolean).pop());
            if (id && id <= TOTAL_POKEMON) evoIds.push({ id, name: chain.species.name });
            chain.evolves_to?.forEach(extractChain);
        }

        extractChain(data.chain);

        if (evoIds.length <= 1) return '';

        const evoData = await Promise.all(
            evoIds.map(async (evo) => {
                const detail = await getPokemonDetail(evo.id);
                return {
                    id: evo.id,
                    name: evo.name,
                    cnName: getChineseName(evo.name) || '',
                    image: detail?.sprites?.other?.['official-artwork']?.front_default
                        || detail?.sprites?.front_default
                        || '',
                };
            })
        );

        return evoData.map((evo, i) => {
            let html = `
                <div class="evo-pokemon" data-id="${evo.id}" onclick="event.stopPropagation();openModal(${evo.id})">
                    <img src="${evo.image}" alt="${evo.name}">
                    <div class="evo-name">${evo.name}</div>
                    ${evo.cnName ? `<div style="font-size:0.65rem;color:#718096;">${evo.cnName}</div>` : ''}
                </div>
            `;
            if (i < evoData.length - 1) {
                html += '<span class="evo-arrow">→</span>';
            }
            return html;
        }).join('');
    } catch {
        return '';
    }
}

// ========== 关闭弹窗 ==========
function closeModal() {
    $modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ========== 显示/隐藏加载状态 ==========
function showLoading(show) {
    if (show) {
        $loading.classList.remove('hidden');
    } else {
        $loading.classList.add('hidden');
    }
}

// ========== 事件监听 ==========

// 搜索
let searchTimeout;
$searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const val = $searchInput.value.trim();
    if (val) {
        $clearSearch.classList.add('visible');
    } else {
        $clearSearch.classList.remove('visible');
    }
    searchTimeout = setTimeout(() => {
        $grid.innerHTML = '';
        displayedCount = 0;
        applyFilters();
    }, 300);
});

$clearSearch.addEventListener('click', () => {
    $searchInput.value = '';
    $clearSearch.classList.remove('visible');
    $grid.innerHTML = '';
    displayedCount = 0;
    applyFilters();
    $searchInput.focus();
});

// 类型筛选
$typeFilters.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('type-btn')) return;

    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    currentType = e.target.dataset.type;
    $grid.innerHTML = '';
    displayedCount = 0;
    await applyFilters();
});

// 排序
$sortRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.checked) {
            currentSort = radio.value;
            $grid.innerHTML = '';
            displayedCount = 0;
            applyFilters();
        }
    });
});

// 加载更多
$loadMoreBtn.addEventListener('click', () => {
    displayPokemon(filteredPokemon.length > 0 ? filteredPokemon : allPokemon);
});

// 关闭弹窗
$modalClose.addEventListener('click', closeModal);
$modalOverlay.addEventListener('click', (e) => {
    if (e.target === $modalOverlay) closeModal();
});

// ESC 关闭弹窗
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// 返回顶部
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        $backToTop.classList.add('visible');
    } else {
        $backToTop.classList.remove('visible');
    }
});

$backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========== 启动 ==========
init();
