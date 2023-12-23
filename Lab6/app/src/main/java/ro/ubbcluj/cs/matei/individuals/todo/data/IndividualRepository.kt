package ro.ubbcluj.cs.matei.individuals.todo.data

import androidx.lifecycle.LiveData
import androidx.work.*
import ro.ubbcluj.cs.matei.individuals.MyWorker
import ro.ubbcluj.cs.matei.individuals.todo.data.local.IndividualDao
import ro.ubbcluj.cs.matei.individuals.core.Result
import ro.ubbcluj.cs.matei.individuals.todo.data.remote.IndividualApi

class  IndividualRepository(private val individualDao: IndividualDao) {

    val individuals = individualDao.getAll()

    suspend fun refresh(): Result<Boolean> {
        try {
            val items = IndividualApi.service.find()
            for (item in items) {
                individualDao.insert(item)
            }
            return Result.Success(true)
        } catch(e: Exception) {
            return Result.Error(e)
        }
    }

    fun getById(individualId: String): LiveData<Individual> {
        return individualDao.getById(individualId)
    }

    suspend fun save(individual: Individual): Result<Individual> {
        try {
            val createdIndividual = IndividualApi.service.create(individual)
            individualDao.insert(createdIndividual)
            return Result.Success(createdIndividual)
        } catch(e: Exception) {
            // here should add the worker
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
            val inputData = Data.Builder()
//                .putAll(itemDao)
                .build()
            val myWork = OneTimeWorkRequest.Builder(MyWorker::class.java)
                .setConstraints(constraints)
                .setInputData(inputData)
                .build()
            /*WorkManager.getInstance(this).apply {
                // enqueue Work
                enqueue(myWork)
            }*/
            return Result.Error(e)
        }
    }

    suspend fun update(individual: Individual): Result<Individual> {
        try {
            val updatedIndividual = IndividualApi.service.update(individual._id, individual)
            individualDao.update(updatedIndividual)
            return Result.Success(updatedIndividual)
        } catch(e: Exception) {
            return Result.Error(e)
        }
    }
}