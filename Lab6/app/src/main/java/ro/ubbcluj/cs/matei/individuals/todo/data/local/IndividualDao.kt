package ro.ubbcluj.cs.matei.individuals.todo.data.local

import androidx.lifecycle.LiveData
import androidx.room.*
import ro.ubbcluj.cs.matei.individuals.todo.data.Individual

@Dao
interface IndividualDao {
    @Query("SELECT * from individuals ORDER BY name ASC")
    fun getAll(): LiveData<List<Individual>>

    @Query("SELECT * FROM individuals WHERE _id=:id ")
    fun getById(id: String): LiveData<Individual>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(individual: Individual)

    @Update(onConflict = OnConflictStrategy.REPLACE)
    suspend fun update(individual: Individual)

    @Query("DELETE FROM individuals")
    suspend fun deleteAll()
}