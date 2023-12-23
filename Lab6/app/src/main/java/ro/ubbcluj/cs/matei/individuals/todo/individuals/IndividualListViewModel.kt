package ro.ubbcluj.cs.matei.individuals.todo.individuals

import android.app.Application
import android.util.Log
import androidx.lifecycle.*
import kotlinx.coroutines.launch
import ro.ubbcluj.cs.matei.individuals.todo.data.local.LocalDatabase
import ro.ubbcluj.cs.matei.individuals.core.Result
import ro.ubbcluj.cs.matei.individuals.core.TAG
import ro.ubbcluj.cs.matei.individuals.todo.data.Individual
import ro.ubbcluj.cs.matei.individuals.todo.data.IndividualRepository

class IndividualListViewModel(application: Application) : AndroidViewModel(application) {
    private val mutableLoading = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val individuals: LiveData<List<Individual>>
    val loading: LiveData<Boolean> = mutableLoading
    val loadingError: LiveData<Exception> = mutableException

    val individualRepository: IndividualRepository

    init {
        val individualDao = LocalDatabase.getDatabase(application, viewModelScope).individualDao()
        individualRepository = IndividualRepository(individualDao)
        individuals = individualRepository.individuals
    }

    fun refresh() {
        viewModelScope.launch {
            Log.v(TAG, "refresh...");
            mutableLoading.value = true
            mutableException.value = null
            when (val result = individualRepository.refresh()) {
                is Result.Success -> {
                    Log.d(TAG, "refresh succeeded");
                }
                is Result.Error -> {
                    Log.w(TAG, "refresh failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableLoading.value = false
        }
    }
}
