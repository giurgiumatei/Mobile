package ro.ubbcluj.cs.matei.individuals.todo.individual

import android.app.Application
import android.util.Log
import androidx.lifecycle.*
import kotlinx.coroutines.launch
import ro.ubbcluj.cs.matei.individuals.todo.data.local.LocalDatabase
import ro.ubbcluj.cs.matei.individuals.core.Result
import ro.ubbcluj.cs.matei.individuals.core.TAG
import ro.ubbcluj.cs.matei.individuals.todo.data.Individual
import ro.ubbcluj.cs.matei.individuals.todo.data.IndividualRepository

class IndividualEditViewModel(application: Application) : AndroidViewModel(application) {
    private val mutableFetching = MutableLiveData<Boolean>().apply { value = false }
    private val mutableCompleted = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val fetching: LiveData<Boolean> = mutableFetching
    val fetchingError: LiveData<Exception> = mutableException
    val completed: LiveData<Boolean> = mutableCompleted

    val individualRepository: IndividualRepository

    init {
        val individualDao = LocalDatabase.getDatabase(application, viewModelScope).individualDao()
        individualRepository = IndividualRepository(individualDao)
    }

    fun getIndividualById(individualId: String): LiveData<Individual> {
        Log.v(TAG, "getIndividualById...")
        return individualRepository.getById(individualId)
    }

    fun saveOrUpdateIndividual(individual: Individual) {
        viewModelScope.launch {
            Log.v(TAG, "saveOrUpdateIndividual...");
            mutableFetching.value = true
            mutableException.value = null
            val result: Result<Individual>
            if (individual._id.isNotEmpty()) {
                result = individualRepository.update(individual)
            } else {
                individual._id = individual.name
                result = individualRepository.save(individual)
            }
            when(result) {
                is Result.Success -> {
                    Log.d(TAG, "saveOrUpdateIndividual succeeded");
                }
                is Result.Error -> {
                    Log.w(TAG, "saveOrUpdateIndividual failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableCompleted.value = true
            mutableFetching.value = false
        }
    }
}