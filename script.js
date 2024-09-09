let radioValue = 5;
let listOfData = [
    { key: '1', week: '第一周', day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
    { key: '2', week: '第二周', day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
    { key: '3', week: '第三周', day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
    { key: '4', week: '第四周', day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' }
];
let weakRunValue = '50';
let paoli = '';
let time = new Date(0, 0, 0, 0, 20, 0);

function getPlan() {
    const distanceElements = document.getElementsByName('distance');
    for (let i = 0; i < distanceElements.length; i++) {
        if (distanceElements[i].checked) {
            radioValue = distanceElements[i].value;
        }
    }
	
	var timePicker = document.getElementById("timePicker");
	var time1 = timePicker.value;

	// 将时间字符串转换为分钟
	var hours = parseInt(time1.split(':')[0], 10);
	var minutes = parseInt(time1.split(':')[1], 10);
	var seconds = parseInt(time1.split(':')[2], 10);
	if (isNaN(seconds)) {seconds = 0}
	var totalMinutes = hours * 60 + minutes + seconds / 60;
	

    timeT = totalMinutes;
	
	var weeklyrun = document.getElementById("weeklyRun");
    var weeklyrunValue = weeklyrun.value;
	
	
	
    const vdot = calculateVDOT(radioValue * 1000, timeT);
    updatePaoli(vdot.toFixed(1));
    updateTrainingPlan(vdot, weeklyrunValue);
    updatePaces(vdot);
    updatePredictions(vdot, radioValue, timeT);
}

function calculateVDOT(distance, time) {
    return Formula.getVDOT(distance, time)
}

function updatePaoli(paoli) {
    document.getElementById('paoli').textContent = paoli;
}

function updateTrainingPlan(vdot, weeklyRun) {
    const trainingPlanTable = document.getElementById('trainingPlanTable');
    trainingPlanTable.innerHTML = `
        <tr>
            <th>Week</th>
            <th>周一</th>
            <th>周二(E)</th>
            <th>周三</th>
            <th>周四</th>
            <th>周五</th>
            <th>周六(E)</th>
            <th>周日(LSD)</th>
        </tr>
    `;
	
	listOfData = Formula.getPlanListEasy(vdot, weeklyRun)
	
    listOfData.forEach(week => {
        const row = `<tr>
            <td>${week.week}</td>
            <td>${week.day1}</td>
            <td>${week.day2}</td>
            <td>${week.day3}</td>
            <td>${week.day4}</td>
            <td>${week.day5}</td>
            <td>${week.day6}</td>
            <td>${week.day7}</td>
        </tr>`;
        trainingPlanTable.innerHTML += row;
    });
}

function updatePaces(vdot) {
    const paceTable = document.getElementById('paceTable');
    paceTable.innerHTML = `
        <tr>
            <th>跑步区间</th>
            <th>配速</th>
        </tr>
    `;
	
	this.paces = [
		{key:'1', type: '轻松跑配速', pace :Formula.getPaces(vdot, 'E')} ,
		{key:'2', type: '马拉松配速', pace :Formula.getPaces(vdot, 'M')},
		{key:'3', type: '乳酸阈配速', pace :Formula.getPaces(vdot, 'T')},
		{key:'4', type: '间歇跑配速', pace :Formula.getPaces(vdot, 'I')},
		{key:'5', type: '全力跑配速', pace :Formula.getPaces(vdot, 'R')},
	];
	console.log('get paces ' + Formula.getPaces(vdot, 'E'))
    paces.forEach(pace => {
        const row = `<tr>
            <td>${pace.type}</td>
            <td>${pace.pace}</td>
        </tr>`;
        paceTable.innerHTML += row;
    });
}

function updatePredictions(vdot, radioValue, timeT) {
    const predictionTable = document.getElementById('predictionTable');
    predictionTable.innerHTML = `
        <tr>
            <th>距离</th>
            <th>成绩</th>
            <th>配速</th>
        </tr>
    `;
	
	equivalent = [
		{key:'1', distance: '3公里', time:Formula.getEqual(vdot, 3000), pace:Formula.getEqualPace(vdot, 3000)} ,
		{key:'2', distance: '5公里', time:Formula.getEqual(vdot, 5000, radioValue * 1000,timeT), pace:Formula.getEqualPace(vdot, 5000)} ,
		{key:'3', distance: '10公里', time:Formula.getEqual(vdot, 10000, radioValue * 1000,timeT), pace:Formula.getEqualPace(vdot, 10000)},
		{key:'4', distance: '半马', time:Formula.getEqual(vdot, 21097.5, radioValue * 1000,timeT), pace:Formula.getEqualPace(vdot, 21097.5)},
		{key:'5', distance: '全马', time:Formula.getEqual(vdot, 42195, radioValue * 1000,timeT), pace:Formula.getEqualPace(vdot, 42195)}
	]
	
    equivalent.forEach(pred => {
        const row = `<tr>
            <td>${pred.distance}</td>
            <td>${pred.time}</td>
            <td>${pred.pace}</td>
        </tr>`;
        predictionTable.innerHTML += row;
    });
}



// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    getPlan();
});

var Formula = {
    _SlowVdotLimit: 39,

    // 计算的与输入的会有点误差，所以这边需要取输入的值
    getEqual: function(vdot, distance, inputDist, inputTime) {


        var time = Formula.getPredictedRaceTime(vdot, distance);

        console.log('get distance ' + distance + ' total time  ' + time)

        var equalPace = Formula._toMinutes((time / (distance / 1000))); // 计算时间/距离

        console.log('get equalPace  ' + equalPace)
        console.log('getEqual distance ' + distance + ' inputDist ' + inputDist + '  inputTime '  + inputTime)
        if (distance == inputDist) {
          return Formula._toMinutes(inputTime);
        }
        else {
          return Formula._toMinutes(Formula.getPredictedRaceTime(vdot, distance));
        }
    },

    getEqualPace: function(vdot, distance) {
        var time = Formula.getPredictedRaceTime(vdot, distance);

        console.log('getEqualPace get distance ' + distance + ' total time  ' + time)

        var equalPace = Formula._toMinutes((time / (distance / 1000))); // 计算时间/距离

        console.log('getEqualPace get equalPace  ' + equalPace)
        return equalPace;
    },

    getVDOT: function(distance, time) {
        console.log('vdot distance: ' + distance + ' time ' + time)
        var V = this._getVDOTSpeedParam(distance, time);
        var VO2 = this._getVO2(V);
        // fraction of VO2 max
        var F = .80 + .298956 * Math.exp(-.193261 * time) + .189439 * Math.exp(-.012778 * time);
        return VO2 / F;
    },

    getPaces: function(vdot, type) {
      if (type == 'E') {
        return Formula._formatTime(Formula.getEasyPace(vdot, 1000, true)) + '-'
               + Formula._formatTime(Formula.getEasyPace(vdot, 1000, false));
      }
      else if (type == 'M') {
        return Formula._formatTime(Formula.getMarathonPace(vdot, 1000));
      }
      else if (type == 'T') {
        return Formula._formatTime(Formula.getThresholdPace(vdot, 1000));
      }
      else if (type == 'I') {
        return Formula._formatTime(Formula.getIntervalPace(vdot, 1000));
      }
      else if (type == 'R') {
        return Formula._formatTime(Formula.getRepetitionPace(vdot, 1000));
      }
      return "0:0";
    },

    _getVDOTSpeedParam(meters, minutes) {
        if (meters >= 1600) {
            return meters / minutes;
        }

        if (meters > 800) {
            const scale = 1600 / meters;
            const percentage = (1600 - meters) / 800;
            const adjustment = scale + 0.1 * percentage;
            const m1600Mins = minutes * adjustment;
            return 1600 / m1600Mins;
        } else {
            const m800Adjustment = 2.1;
            const distanceFactor = 800 / meters;
            const adjustment = distanceFactor * m800Adjustment;
            const m1600Mins = minutes * adjustment;
            return 1600 / m1600Mins;
        }
    },

    _formatTime: function(time) {
		var minutes = Math.floor(time);
		var seconds = Math.round(((time - Math.floor(time)) * 60));

		// 如果秒数超过59，增加分钟数并重置秒数
		if (seconds >= 60) {
			minutes += 1;
			seconds = 0;
		}

		// 格式化分钟和秒数，确保秒数不满10时前面补0
		var strMinutes = minutes.toString();
		var strSeconds = seconds < 10 ? '0' + seconds : seconds.toString();

		return strMinutes + ':' + strSeconds;
    },

    getMarathonPace: function(VDOT, trainingDistance) {
        return trainingDistance / Formula._getMarathonVelocity(VDOT);
    },

    getEasyPace: function(vdot, distance, isBest) {
        if (isBest) {
          return this._getCustomEffortPace(vdot, distance, .7);
        }
        return this._getCustomEffortPace(vdot, distance, .62);
        //
    },



    getThresholdPace: function(vdot, distance) {
        if (this._isSlowVdot(vdot)) {
            var srvdot = this._getSRVDOT(vdot);
            vdot = (srvdot + parseFloat(vdot)) / 2;
        }

        return this._getCustomEffortPace(vdot, distance, .88);
    },

    getIntervalPace: function(vdot, distance) {
        if (this._isSlowVdot(vdot)) {
            vdot = this._getSRVDOT(vdot);
        }

        return this._getCustomEffortPace(vdot, distance, .975);
    },

    getRepetitionPace: function(vdot, distance) {
        const per400FasterBy = 6.0;
        const divisor = (distance / 400) * (per400FasterBy / 60);

        const pace = this.getIntervalPace(vdot, distance);
        return pace - divisor;
    },


    getFastRepsPace: function(vdot, distance) {
        var per200FasterBy = 4.0;
        var divisor = (distance / 200) * (per200FasterBy / 60);
        var pace = this.getRepetitionPace(vdot, distance);
        return pace - divisor;
    },

    isFastRepsDistance: function(distance) {
        return distance === 200 ||
            distance === 300 ||
            distance === 400 ||
            distance === 600;
    },
    _isSlowVdot: function(vdot) {
        return vdot > 0 && vdot < Formula._SlowVdotLimit;
    },

    _getSRVDOT: function(vdot) {
        return (vdot * 2 / 3) + 13;
    },
    _getCustomEffortPace: function(vdot, distance, percentage) {
        var O = vdot * percentage;
        var V = Formula._getPaceVelocity(O);
        return distance / V;
    },

    _getVO2: function(V) {
        return .182258 * V + .000104 * Math.pow(V, 2) - 4.6;
    },

    _getPaceVelocity: function(O) {
        return 29.54 + 5.000663 * O - .007546 * Math.pow(O, 2);
    },

    _getMarathonVelocity: function(VDOT) {
        var distance = 42195;
        var A = distance / (4 * VDOT);
        for (var i = 0; i < 3; i++) {
            var B = Math.exp(-.193261 * A);
            var C = .298956 * B + Math.exp(-.012778 * A) * .189439 + .8;
            var E = Math.pow((VDOT * C), 2) * -.0075 + (VDOT * C) * 5.000663 + 29.54;
            var G = (.298956 * B) * .19326;
            var H = G - Math.exp(-.012778 * A) * .189439 * (-.012778);
            var I = (C * H * VDOT) * (-.007546) * 3;
            var J = (H * VDOT) * 5.000663 + I;
            var K = (distance * J) / Math.pow(E, 2) + 1;
            var L = A - (distance / E);
            var P = L / K;
            A = A - P;
        }
        return distance / A;
        /*var V = distance / A;
        return trainingDistance / V;*/
    },
    getPredictedRaceTime: function(VDOT, distance) {
        var A = distance / (4 * VDOT);
        for (var i = 0; i < 3; i++) {
            var B = Math.exp(-.193261 * A);
            var C = .298956 * B + Math.exp(-.012778 * A) * .189439 + .8;
            var E = Math.pow((VDOT * C), 2) * -.0075 + (VDOT * C) * 5.000663 + 29.54;
            var G = (.298956 * B) * .19326;
            var H = G - Math.exp(-.012778 * A) * .189439 * (-.012778);
            var I = (C * H * VDOT) * (-.007546) * 3;
            var J = (H * VDOT) * 5.000663 + I;
            var K = (distance * J) / Math.pow(E, 2) + 1;
            var L = A - (distance / E);
            var P = L / K;
            A = A - P;
        }
        const V = distance / A;
        const time = distance / V; // distance over velocity

        console.log('VDOT ' + VDOT + ' distance ' + distance + '  time '  + time);
        if (distance >= 1600) {
            return time;
        }

        const adjustedV = this._getVDOTSpeedParam(distance, time);

        const scale = V / adjustedV;

        console.log('VDOT ' + VDOT + ' distance ' + distance + '  time '  + time / scale)

        return time / scale;
    },
	
	_toMinutes: function(value) {

        var minutes = Math.floor(value);
        const secondsFraction = value - minutes;
        var seconds = secondsFraction * 60;
        var decimal = 0;

        seconds = Math.round(seconds);

        if (seconds === 60) {
            seconds = 0;
            minutes += 1;
        }

        if (minutes < 60 && seconds === 0 && decimal === 0) {
            return minutes.toString() + ":00";
        }

        const decimalText = "";

        if (minutes < 60) {
            return minutes.toString() + ":" + (seconds.toString().length === 1 ? "0" : "") + seconds.toString() + decimalText;
        }

        const hours = Math.floor(minutes / 60); // lets say its... 72 minutes. 72 / 60 = 1
        minutes = minutes - (hours * 60);
        return hours.toString() + ':' + (minutes.toString().length === 1 ? "0" : "") + minutes.toString() + ":" + (seconds.toString().length === 1 ? "0" : "") + seconds.toString() +
            decimalText;

    },
	
	getPlanList: function(vdot, distance) {
		var weekDistance = distance;
		var Idistance = 1;  //I的距离为1000
		var Rdistance = 0.5; //R的距离为500

		// 算法 E配速 30%  M配置 20%  T配速 10%   I配速8%  R配速5%
		// 一周5练   E(最大)/M/T/I(或R)/E（剩余）

		var M = Math.ceil(weekDistance * 0.2); //向上取整
		var T = Math.ceil(weekDistance * 0.1);
		var E = Math.ceil(weekDistance * 0.3);
		// 1000米  最多10公里
		var I = (weekDistance * 0.08 <= 10 ? Math.ceil(weekDistance * 0.08) : 10);
		// 400米  最多8公里
		var R = (weekDistance * 0.05 <= 8 ? weekDistance * 0.05 : 8);

		var EI = Math.ceil(weekDistance - (M + T + I + E)); //剩余的训练
		var ER = Math.ceil(weekDistance - (M + T + R + E)); //剩余的训练

		var EIT = E + EI
		var EE = E;
		// 周日长距离
		if (EIT > 28) {
		  EI = 21;
		  E = EIT -21;
		}

		// 轻松跑两次，一个半马 一次其他
		var ERT = EE + ER

		// 周日长距离
		if (ERT > 28) {
		  ER = 21;
		  EE = ERT -21;
		}

		var allData = [{
			  key: '1',
			  week: '第一周',
			  day2: '' + E + '(' + Formula.getPaces(vdot, 'E') +')',
			  day1: '休息',
			  day3: '' + I + '(' + Formula.getPaces(vdot, 'I') +')' + '\r\n 1000米 * ' + Math.ceil(I / Idistance),
			  day4: '休息',
			  day5: '' + T + '(' + Formula.getPaces(vdot, 'T') +')' ,
			  day7: '' + EI + '(' + Formula.getPaces(vdot, 'E') +')',
			  day6: '' + M + '(' + Formula.getPaces(vdot, 'M') +')'
			},
			{
			  key: '2',
			  week: '第二周',
			  day2: '' + EE + '(' + Formula.getPaces(vdot, 'E') +')',
			  day1: '休息',
			  day3: '' + R + '(' + Formula.getPaces(vdot, 'R') +')' + '\n 500米 * ' + Math.ceil(R / Rdistance),
			  day4: '休息',
			  day5: '' + T + '(' + Formula.getPaces(vdot, 'T') +')',
			  day7: '' + ER + '(' + Formula.getPaces(vdot, 'E') +')',
			  day6: '' + M + '(' + Formula.getPaces(vdot, 'M') +')'
			},
			{
			  key: '3',
			  week: '第三周',
			  day2: '' + E + '(' + Formula.getPaces(vdot, 'E') +')',
			  day1: '休息',
			  day3: '' + I + '(' + Formula.getPaces(vdot, 'I') +')' + '\n 1000米 * ' + Math.ceil(I / Idistance),
			  day4: '休息',
			  day5: '' + T + '(' + Formula.getPaces(vdot, 'T') +')',
			  day7: '' + EI + '(' + Formula.getPaces(vdot, 'E') +')',
			  day6: '' + M + '(' + Formula.getPaces(vdot, 'M') +')'
			},
			{
			  key: '4',
			  week: '第四周',
			  day2: '' + EE + '(' + Formula.getPaces(vdot, 'E') +')',
			  day1: '休息',
			  day3: '' + R + '(' + Formula.getPaces(vdot, 'R') +')' + '\n 500米 * ' + Math.ceil(R / Rdistance),
			  day4: '休息',
			  day5: '' + T + '(' + Formula.getPaces(vdot, 'T') +')',
			  day7: '' + ER + '(' + Formula.getPaces(vdot, 'E') +')',
			  day6: '' + M + '(' + Formula.getPaces(vdot, 'M') +')'
			}
		 ];
		 return allData;
	},
	getPlanListEasy: function(vdot, distance) {
		var weekDistance = distance;
		var Idistance = 1;  //I的距离为1000
		var Rdistance = 0.5; //R的距离为500

		// 算法 E配速 30%  M配置 20%  T配速 10%   I配速8%  R配速5%
		// 一周5练   E(最大)/M/T/I(或R)/E（剩余）

		var M = Math.ceil(weekDistance * 0.2); //向上取整
		var T = Math.ceil(weekDistance * 0.1);
		var E = Math.ceil(weekDistance * 0.3);
		// 1000米  最多10公里
		var I = (weekDistance * 0.08 <= 10 ? Math.ceil(weekDistance * 0.08) : 10);
		// 400米  最多8公里
		var R = (weekDistance * 0.05 <= 8 ? weekDistance * 0.05 : 8);

		var EI = Math.ceil(weekDistance - (M + T + I + E)); //剩余的训练
		var ER = Math.ceil(weekDistance - (M + T + R + E)); //剩余的训练

		var EIT = E + EI
		var EE = E;
		// 周日长距离
		if (EIT > 28 && EIT < 42) {
		  EI = 21;
		  E = EIT -21;
		}
		else if (EIT > 41) {
		  E = 21;
		  EI = EIT -21;		  	
		}

		// 轻松跑两次，一个半马 一次其他
		var ERT = EE + ER

		// 周日长距离
		if (ERT > 28 && ERT < 42) {
		  ER = 21;
		  EE = ERT -21;
		}
		else if (ERT > 41) {
		  EE = 21;
		  ER = ERT -21;		
		}

		var allData = [{
			  key: '1',
			  week: '第一周',
			  day2: '' + E + '(' + Formula.getPaces(vdot, 'E') +')',
			  day1: '休息',
			  day3: '' + I + '(' + Formula.getPaces(vdot, 'I') +')' + '\r\n 1000米 * ' + Math.ceil(I / Idistance),
			  day4: '休息',
			  day5: '' + T + '(' + Formula.getPaces(vdot, 'T') +')' ,
			  day7: '' + EI + '(' + Formula.getPaces(vdot, 'E') +')',
			  day6: '' + M + '(' + Formula.getPaces(vdot, 'E') +')'
			},
			{
			  key: '2',
			  week: '第二周',
			  day2: '' + EE + '(' + Formula.getPaces(vdot, 'E') +')',
			  day1: '休息',
			  day3: '' + R + '(' + Formula.getPaces(vdot, 'R') +')' + '\n 500米 * ' + Math.ceil(R / Rdistance),
			  day4: '休息',
			  day5: '' + M + '(' + Formula.getPaces(vdot, 'M') +')',
			  day7: '' + ER + '(' + Formula.getPaces(vdot, 'E') +')',
			  day6: '' + T + '(' + Formula.getPaces(vdot, 'E') +')'
			},
			{
			  key: '3',
			  week: '第三周',
			  day2: '' + E + '(' + Formula.getPaces(vdot, 'E') +')',
			  day1: '休息',
			  day3: '' + I + '(' + Formula.getPaces(vdot, 'I') +')' + '\n 1000米 * ' + Math.ceil(I / Idistance),
			  day4: '休息',
			  day5: '' + T + '(' + Formula.getPaces(vdot, 'T') +')',
			  day7: '' + EI + '(' + Formula.getPaces(vdot, 'E') +')',
			  day6: '' + M + '(' + Formula.getPaces(vdot, 'E') +')'
			},
			{
			  key: '4',
			  week: '第四周',
			  day2: '' + EE + '(' + Formula.getPaces(vdot, 'E') +')',
			  day1: '休息',
			  day3: '' + R + '(' + Formula.getPaces(vdot, 'R') +')' + '\n 500米 * ' + Math.ceil(R / Rdistance),
			  day4: '休息',
			  day5: '' + M + '(' + Formula.getPaces(vdot, 'M') +')',
			  day7: '' + ER + '(' + Formula.getPaces(vdot, 'E') +')',
			  day6: '' + T + '(' + Formula.getPaces(vdot, 'E') +')'
			}
		 ];
		 return allData;
	}

};
