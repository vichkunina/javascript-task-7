'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise}
 */

function runParallel(jobs, parallelNum, timeout = 1000) {
    let result = [];
    let countStartedJobs = 0;
    let countFinishedJobs = 0;
    
    return new Promise(resolve => {
        if (!jobs.length) {
            resolve([]);
        }
        while (countStartedJobs < parallelNum) {
            runJob(countStartedJobs++, resolve);
        }
    });

    function runJob(job, resolve) {
        let handler = jobResult => finishJob(jobResult, job, resolve);

        return new Promise((timeResolve, timeReject) => {
            jobs[job]().then(timeResolve, timeReject);
            setTimeout(() => timeReject(new Error('Promise timeout')), timeout);
        }).then(handler)
            .catch(handler);
    }

    function finishJob(jobResult, job, resolve) {
        result[job] = jobResult;
        if (jobs.length === ++countFinishedJobs) {
            resolve(result);
        }
        if (countStartedJobs < jobs.length) {
            runJob(countStartedJobs++, resolve);
        }
    }
}
