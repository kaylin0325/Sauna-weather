// ==========================================
// 도시별 좌표
// ==========================================

const cities = {

    서울: {
        lat: 37.5665,
        lon: 126.9780
    },

    인천: {
        lat: 37.4563,
        lon: 126.7052
    },

    춘천: {
        lat: 37.8813,
        lon: 127.7298
    },

    강릉: {
        lat: 37.7519,
        lon: 128.8761
    },

    대전: {
        lat: 36.3504,
        lon: 127.3845
    },

    대구: {
        lat: 35.8714,
        lon: 128.6014
    },

    광주: {
        lat: 35.1595,
        lon: 126.8526
    },

    부산: {
        lat: 35.1796,
        lon: 129.0756
    },

    제주: {
        lat: 33.4996,
        lon: 126.5312
    }

};


// ==========================================
// 날씨 API 가져오기
// ==========================================

async function getWeather(cityName) {

    const city = cities[cityName];

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${city.lat}` +
        `&longitude=${city.lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature` +
        `&hourly=temperature_2m,relative_humidity_2m` +
        `&daily=temperature_2m_max,temperature_2m_min` +
        `&timezone=Asia%2FSeoul`;

    try {

        const response = await fetch(url);

        const data = await response.json();

        return data;

    } catch (error) {

        console.error("날씨 데이터를 가져오지 못했습니다.", error);

    }
}


// ==========================================
// 사우나 종류
// ==========================================

function getSaunaType(temp, humidity) {

    if (temp >= 35) {

        return "극한사우나";

    }

    if (temp >= 32) {

        return "고온사우나";

    }

    if (temp >= 28 && humidity >= 70) {

        return "습식사우나";

    }

    if (temp >= 28) {

        return "건식사우나";

    }

    if (temp >= 24) {

        return "따뜻한 찜질방";

    }

    if (temp >= 18) {

        return "미지근한 찜질방";

    }

    return "냉탕";
}


// ==========================================
// 사우나 설명
// ==========================================

function getSaunaDescription(temp, humidity) {

    if (temp >= 33) {

        return "오늘은 찜질방보다 한증막에 가깝습니다";

    }

    if (temp >= 30 && humidity >= 70) {

        return "덥고 습해서 땀이 빠르게 납니다";

    }

    if (temp >= 30 && humidity < 70) {

        return "땀은 나는데 끈적이지 않습니다";

    }

    if (temp >= 25) {

        return "몸이 천천히 데워지는 날씨입니다";

    }

    if (temp >= 18) {

        return "가볍게 몸을 덥히기 좋은 날입니다";

    }

    return "오늘은 냉탕 쪽이 더 어울립니다";

}


// ==========================================
// 시간에 맞는 시간별 날씨 찾기
// ==========================================

function getCurrentHourIndex(times) {

    const now = new Date();

    let closestIndex = 0;

    let smallestDifference = Infinity;


    times.forEach((time, index) => {

        const weatherTime = new Date(time);

        const difference =
            Math.abs(weatherTime - now);


        if (difference < smallestDifference) {

            smallestDifference = difference;

            closestIndex = index;

        }

    });


    return closestIndex;
}


// ==========================================
// 화면에 날씨 표시
// ==========================================

function displayWeather(cityName, data) {

    const current = data.current;

    const daily = data.daily;


    const temperature =
        Math.round(current.temperature_2m);

    const humidity =
        Math.round(current.relative_humidity_2m);

    const feelsLike =
        Math.round(current.apparent_temperature);


    // 도시
    document.getElementById("city").textContent =
        cityName;


    // 현재 온도
    document.getElementById("temperature").textContent =
        temperature;


    // 체감온도
    document.getElementById("feelsLike").textContent =
        feelsLike;


    // 습도
    document.getElementById("humidity").textContent =
        humidity;


    // 최고기온
    document.getElementById("maxTemp").textContent =
        Math.round(daily.temperature_2m_max[0]);


    // 최저기온
    document.getElementById("minTemp").textContent =
        Math.round(daily.temperature_2m_min[0]);


    // 사우나 상태
    document.getElementById("saunaType").textContent =
        getSaunaType(temperature, humidity);


    // 설명
    document.getElementById("description").textContent =
        getSaunaDescription(temperature, humidity);


    // 시간별 날씨
    displayHourly(data);

}


// ==========================================
// 시간별 날씨 표시
// ==========================================

function displayHourly(data) {

    const container =
        document.getElementById("hourlyWeather");


    container.innerHTML = "";


    const times =
        data.hourly.time;

    const temperatures =
        data.hourly.temperature_2m;


    const currentIndex =
        getCurrentHourIndex(times);


    // 현재 시간부터 7개 표시
    for (
        let i = currentIndex;
        i < currentIndex + 7 && i < times.length;
        i++
    ) {

        const date =
            new Date(times[i]);


        const hour =
            date.getHours();


        const temperature =
            Math.round(temperatures[i]);


        const sauna =
            getSaunaType(
                temperature,
                data.hourly.relative_humidity_2m[i]
            );


        const hourHTML = `

            <div class="hour">

                <div class="hour-time">
                    ${i === currentIndex ? "지금" : hour + "시"}
                </div>

                <div class="hour-icon">
                    🔥
                </div>

                <div class="hour-sauna">
                    ${sauna}
                </div>

                <div class="hour-temp">
                    ${temperature}°
                </div>

            </div>

        `;


        container.innerHTML += hourHTML;

    }

}


// ==========================================
// 지역 버튼 클릭
// ==========================================

document
    .querySelectorAll(".cities button")
    .forEach(button => {


        button.addEventListener(
            "click",
            async function () {


                // 현재 선택된 도시
                const cityName =
                    this.dataset.city;


                // 버튼 디자인 변경
                document
                    .querySelectorAll(".cities button")
                    .forEach(btn => {

                        btn.classList.remove("active");

                    });


                this.classList.add("active");


                // 날씨 가져오기
                const data =
                    await getWeather(cityName);


                // 화면 업데이트
                displayWeather(
                    cityName,
                    data
                );

            }
        );

    });


// ==========================================
// 처음 페이지 실행
// ==========================================

async function init() {

    const data =
        await getWeather("서울");


    if (data) {

        displayWeather(
            "서울",
            data
        );

    }

}


// 실행
init();