// 숫자 -> 키 매핑
const words = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

// 최상단에 언어 데이터 추가
const i18n = {
    ko: {
        appTitle: "스킬 뽑기 시뮬레이터",
        stageProbTitle: "스테이지 확률",
        stageSelectHelp1: "좌/우 화살표로 스테이지 선택 (1-1 ~ 10-10)",
        stageSelectHelp2: "키보드: ← / → 로도 변경 가능",
        goToStage: "이동",
        resetSeed: "Skill Seed 초기화",
        startSimulate: "회 뽑기 시작!",
        resultTitle: "뽑기 결과",
        rateNormal: "일반",
        rateRare: "희귀한",
        rateEpic: "서사시",
        rateLegendary: "전설",
        rateUltimate: "궁극의",
        rateMythic: "신화",
        skillCountUnit: "개",
        // ... 기타 모든 텍스트
    },
    en: {
        appTitle: "Skill Gacha Simulator",
        stageProbTitle: "Stage Probabilities",
        stageSelectHelp1: "Select stage with Left/Right arrows (1-1 ~ 10-10)",
        stageSelectHelp2: "Keyboard: ← / → also works",
        goToStage: "Go",
        resetSeed: "Reset Skill Seed",
        startSimulate: "Trials Start!",
        resultTitle: "Gacha Results",
        rateNormal: "Normal",
        rateRare: "Rare",
        rateEpic: "Epic",
        rateLegendary: "Legendary",
        rateUltimate: "Ultimate",
        rateMythic: "Mythic",
        skillCountUnit: "ea",
        // ... etc.
    }
};

let currentLang = localStorage.getItem('language') || 'ko';

// 언어 업데이트 함수
function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);

    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.dataset.langKey;
        if (i18n[lang][key]) {
            el.textContent = i18n[lang][key];
        }
    });

    // 동적으로 생성되는 텍스트들도 업데이트
    renderRates(); 
    // 만약 결과가 표시된 상태라면 결과 텍스트도 업데이트
    const resultSection = document.getElementById('resultSection');
    if(resultSection.style.display === 'block') {
        // displayResults 함수를 다시 호출하거나, 텍스트만 바꾸는 로직 추가
    }

    // 활성 버튼 스타일 업데이트
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

// 언어 버튼 이벤트 리스너
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        updateLanguage(btn.dataset.lang);
    });
});

// 페이지 로드 시 초기 언어 설정
document.addEventListener('DOMContentLoaded', () => {
    updateLanguage(currentLang);
});

// localStorage에서 마지막 선택 스테이지 불러오기
const savedStage = localStorage.getItem('selectedStage');
let major = 1; // 1..10
let minor = 1; // 1..10

if (savedStage) {
	const [savedMajor, savedMinor] = savedStage.split('-').map(Number);
	if (savedMajor >= 1 && savedMajor <= 10 && savedMinor >= 1 && savedMinor <= 10) {
		major = savedMajor;
		minor = savedMinor;
	}
}

let data = null;

const stageText = document.getElementById('stageText');
const ratesTbody = document.querySelector('#ratesTable tbody');
const warningEl = document.getElementById('warning');
const stageTitle = document.getElementById('stageTitle');

function numToKey(n) {
	return words[n - 1];
}

function formatPercent(v) {
	// JSON 값은 10000 기준(예: 1750 -> 17.50%)
	const pct = (v / 100).toFixed(2);
	return pct + '%';
}

function renderRates() {
    stageText.textContent = `${major}-${minor}`;
    ratesTbody.innerHTML = '';
    warningEl.style.display = 'none';
    // i18n 객체를 사용하도록 수정
    stageTitle.textContent = `${i18n[currentLang].stageProbTitle} ${major}-${minor}`;

    // 현재 선택된 스테이지를 localStorage에 저장
    localStorage.setItem('selectedStage', `${major}-${minor}`);

	if (!data) {
		warningEl.textContent = '데이터를 불러오는 중입니다...';
		warningEl.style.display = 'block';
		return;
	}

	const maj = numToKey(major);
	const min = numToKey(minor);
	if (!data[maj] || !data[maj][min]) {
		warningEl.textContent = `해당 스테이지의 데이터가 없습니다: ${maj}.${min}`;
		warningEl.style.display = 'block';
		return;
	}

	const rates = data[maj][min];
	const mapping = [
        ['normal', i18n[currentLang].rateNormal],
        ['rare', i18n[currentLang].rateRare],
        ['epic', i18n[currentLang].rateEpic],
        ['legendary', i18n[currentLang].rateLegendary],
        ['ultimate', i18n[currentLang].rateUltimate],
        ['mythic', i18n[currentLang].rateMythic]
    ];

	for (const [key, label] of mapping) {
		const val = rates[key];
		const tr = document.createElement('tr');
		const tdLabel = document.createElement('td');
		tdLabel.className = 'label';
		tdLabel.textContent = label + ':';
		const tdVal = document.createElement('td');
		tdVal.className = 'value';
		tdVal.textContent = (typeof val === 'number') ? formatPercent(val) : '-';
		tr.appendChild(tdLabel);
		tr.appendChild(tdVal);
		ratesTbody.appendChild(tr);
	}
}

function prevStage() {
	if (minor > 1) {
		minor--;
	} else if (major > 1) {
		major--;
		minor = 10;
	}
	renderRates();
}

function nextStage() {
	if (minor < 10) {
		minor++;
	} else if (major < 10) {
		major++;
		minor = 1;
	}
	renderRates();
}

document.getElementById('prevBtn').addEventListener('click', prevStage);
document.getElementById('nextBtn').addEventListener('click', nextStage);

document.addEventListener('keydown', (e) => {
	if (e.key === 'ArrowLeft') prevStage();
	if (e.key === 'ArrowRight') nextStage();
});

// 직접 입력 기능
const majorInput = document.getElementById('majorInput');
const minorInput = document.getElementById('minorInput');
const goBtn = document.getElementById('goBtn');

// 입력값 범위 제한 (1-10)
function clampInput(input) {
	let value = parseInt(input.value);
	if (isNaN(value) || value < 1) {
		input.value = 1;
	} else if (value > 10) {
		input.value = 10;
	}
}

majorInput.addEventListener('input', () => clampInput(majorInput));
minorInput.addEventListener('input', () => clampInput(minorInput));

function goToStage() {
	const inputMajor = parseInt(majorInput.value);
	const inputMinor = parseInt(minorInput.value);
	
	if (inputMajor >= 1 && inputMajor <= 10 && inputMinor >= 1 && inputMinor <= 10) {
		major = inputMajor;
		minor = inputMinor;
		renderRates();
		// 입력 필드 초기화
		majorInput.value = major;
		minorInput.value = minor;
	} else {
		alert('스테이지는 1-1부터 10-10까지 입력 가능합니다.');
	}
}

goBtn.addEventListener('click', goToStage);

function loadData() {
	try {
		// HTML에 임베드된 JSON 데이터를 읽어옴
		const scriptTag = document.getElementById('skillRateData');
		if (scriptTag) {
			data = JSON.parse(scriptTag.textContent);
		} else {
			throw new Error('skillRateData 스크립트 태그를 찾을 수 없습니다.');
		}
	} catch (err) {
		warningEl.textContent = '데이터 로드 실패: ' + err.message;
		warningEl.style.display = 'block';
	}
	renderRates();
}

loadData();

// 시뮬레이션 기능
const trialCount = document.getElementById('trialCount');
const simulateBtn = document.getElementById('simulateBtn');
const resetSeedBtn = document.getElementById('resetSeedBtn');

// 입력값 범위 제한 (1-100000)
function clampTrialCount() {
	let value = parseInt(trialCount.value);
	if (isNaN(value) || value < 1) {
		trialCount.value = 1;
	} else if (value > 1000) {
		trialCount.value = 1000;
	}
}

trialCount.addEventListener('input', clampTrialCount);

const SKILL_NAME = [
  '외침', '화살', '고기', 
  '수리검', '포격', '광전사',
  '가시', '화살비', '버프',
  '운석', '폭탄', '사기',
  '쇄도', '벌레', '번개',
  '기총소사', '드론', '높은 사기'
];

const SKILL_LIST = [
  ['외침', '화살', '고기'], 
  ['수리검', '포격', '광전사'],
  ['가시', '화살비', '버프'],
  ['운석', '폭탄', '사기'],
  ['쇄도', '벌레', '번개'],
  ['기총소사', '드론', '높은 사기']
];

// 등급명 매핑
const rarity = {
    0: '일반',
    1: '희귀한',
    2: '서사시',
    3: '전설',
    4: '궁극의',
    5: '신화'
};

function skillSimulate() {
	const trials = parseInt(trialCount.value);
	
	if (!data) {
		alert('데이터가 로드되지 않았습니다.');
		return;
	}
	
	const maj = numToKey(major);
	const min = numToKey(minor);
	
	if (!data[maj] || !data[maj][min]) {
		alert('해당 스테이지의 데이터가 없습니다.');
		return;
	}
	
	const rates = data[maj][min];
	
	console.log(`${major}-${minor} 스테이지에서 ${trials}회 뽑기 시작!`);
	console.log('확률 데이터:', rates);
	
	// skillSeed 값에 따라 등급 결정
	const resultMatrix = [];
	for (let i = 0; i < trials; i++) {
		const rowResults = [];
        const randValues = skillSeed[i];

        for (const randValue of randValues) {
            if (randValue.skillGradeRate <= rates.mythic) {
                rowResults.push(SKILL_LIST[5][randValue.skillTypeRate]);
            } else if (randValue.skillGradeRate <= rates.mythic + rates.ultimate) {
                rowResults.push(SKILL_LIST[4][randValue.skillTypeRate]);
            } else if (randValue.skillGradeRate <= rates.mythic + rates.ultimate + rates.legendary) {
                rowResults.push(SKILL_LIST[3][randValue.skillTypeRate]);
            } else if (randValue.skillGradeRate <= rates.mythic + rates.ultimate + rates.legendary + rates.epic) {
                rowResults.push(SKILL_LIST[2][randValue.skillTypeRate]);
            } else if (randValue.skillGradeRate <= rates.mythic + rates.ultimate + rates.legendary + rates.epic + rates.rare) {
                rowResults.push(SKILL_LIST[1][randValue.skillTypeRate]);
            } else if (randValue.skillGradeRate <= rates.mythic + rates.ultimate + rates.legendary + rates.epic + rates.rare + rates.normal) {
                rowResults.push(SKILL_LIST[0][randValue.skillTypeRate]);
            }
        }
		
		if (rowResults.length > 0) {
			resultMatrix.push(rowResults);
		}
	}
	
	console.log('뽑기 결과:', resultMatrix);
	console.log(`총 ${trials}회 뽑기 완료`);
	
	// 결과를 UI에 표시
	displayResults(resultMatrix);
}

function displayResults(resultMatrix) {
	// 스킬별 개수 집계
	const skillCounts = {};
	
	// SKILL_NAME의 모든 스킬로 초기화
	for (const skill of SKILL_NAME) {
		skillCounts[skill] = 0;
	}
	
	// resultMatrix를 순회하며 카운트
	for (const row of resultMatrix) {
		for (const skillName of row) {
			if (skillCounts[skillName] !== undefined) {
				skillCounts[skillName]++;
			}
		}
	}
	
	// 결과 표시
	const resultSection = document.getElementById('resultSection');
	const resultGrid = document.getElementById('resultGrid');
	
	resultGrid.innerHTML = '';
	
	// 스킬별로 표시
	SKILL_NAME.forEach((skillName, index) => {
		const count = skillCounts[skillName];
		
		const skillItem = document.createElement('div');
		skillItem.className = 'skill-item';
		
		const icon = document.createElement('div');
		icon.className = 'skill-icon';
		icon.style.backgroundPosition = `0px -${index * 48}px`;
		
		const countEl = document.createElement('div');
		countEl.className = 'skill-count';
		countEl.textContent = `${count}개`;
		
		const nameEl = document.createElement('div');
		nameEl.className = 'skill-name';
		nameEl.textContent = skillName;
		
		skillItem.appendChild(icon);
		skillItem.appendChild(countEl);
		skillItem.appendChild(nameEl);
		
		resultGrid.appendChild(skillItem);
	});

	// 상세 결과 표시
	displayDetailResults(resultMatrix);
	
	resultSection.style.display = 'block';
}

function displayDetailResults(resultMatrix) {
	const detailGrid = document.getElementById('detailGrid');
	detailGrid.innerHTML = '';

	resultMatrix.forEach(trial => {
		const trialRow = document.createElement('div');
		trialRow.className = 'trial-row';

		trial.forEach(skillName => {
			const skillIndex = SKILL_NAME.indexOf(skillName);
			if (skillIndex > -1) {
				const iconDiv = document.createElement('div');
				iconDiv.className = 'detail-skill-icon';
				iconDiv.style.backgroundPosition = `0px -${skillIndex * 48}px`;
				iconDiv.title = skillName;
				trialRow.appendChild(iconDiv);
			}
		});
		detailGrid.appendChild(trialRow);
	});
}

function toggleDetailView() {
    const detailArea = document.getElementById('detailArea');
    const toggleArrow = document.getElementById('toggleArrow');
    const isHidden = detailArea.style.display === 'none' || detailArea.style.display === '';

    detailArea.style.display = isHidden ? 'block' : 'none';
    toggleArrow.textContent = isHidden ? '▲' : '▼';

    // 상세 결과가 열릴 때만 스크롤 이동
    if (isHidden) {
        const resultHeader = document.getElementById('resultHeader');
        // DOM이 업데이트된 후 스크롤을 실행하기 위해 짧은 지연 시간을 줍니다.
        setTimeout(() => {
            resultHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

simulateBtn.addEventListener('click', skillSimulate);
document.getElementById('resultHeader').addEventListener('click', toggleDetailView);
resetSeedBtn.addEventListener('click', () => {
	setSkillTable(1000);
	console.log('Skill Seed 초기화:', skillSeed);
	alert(`Skill Seed가 초기화되었습니다. (1000 * 5개의 랜덤값 생성)`);
});

function setSkillTable(count) {
	const randomValues = [];
	for (let i = 0; i < count; i++) {
		// 1 이상 10000 이하의 랜덤 정수 생성
        rowValues = [];
        for (let j = 0; j < 5; j++) {
            rowValues.push({ skillGradeRate: Math.floor(Math.random() * 10000) + 1, skillTypeRate: Math.floor(Math.random() * 3) });
        }
		randomValues.push(rowValues);
	}
	skillSeed = randomValues;
	// localStorage에 저장
	localStorage.setItem('skillSeed', JSON.stringify(skillSeed));
    console.log(skillSeed);
}

// skillSeed 초기화: localStorage에서 불러오거나 새로 생성
let skillSeed = [];
const savedSeed = localStorage.getItem('skillSeed');

if (savedSeed) {
	try {
		skillSeed = JSON.parse(savedSeed);
		console.log('캐싱된 Skill Seed 복원:', skillSeed.length + '개');
	} catch (err) {
		console.error('Skill Seed 복원 실패:', err);
		setSkillTable(1000);
	}
} else {
	setSkillTable(1000);
	console.log('새로운 Skill Seed 생성:', skillSeed.length + '개');
}