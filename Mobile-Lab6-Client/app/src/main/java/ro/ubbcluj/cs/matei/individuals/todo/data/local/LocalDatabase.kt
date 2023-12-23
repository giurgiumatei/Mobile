package ro.ubbcluj.cs.matei.individuals.todo.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import ro.ubbcluj.cs.matei.individuals.todo.data.Individual

@Database(entities = [Individual::class], version = 1)
abstract class LocalDatabase : RoomDatabase() {

    abstract fun individualDao(): IndividualDao

    companion object {
        @Volatile
        private var INSTANCE: LocalDatabase? = null

        //        @kotlinx.coroutines.InternalCoroutinesApi()
        fun getDatabase(context: Context, scope: CoroutineScope): LocalDatabase {
            val inst = INSTANCE
            if (inst != null) {
                return inst
            }
            val instance =
                Room.databaseBuilder(
                    context.applicationContext,
                    LocalDatabase::class.java,
                    "local_db"
                )
                    .addCallback(WordDatabaseCallback(scope))
                    .build()
            INSTANCE = instance
            return instance
        }

        private class WordDatabaseCallback(private val scope: CoroutineScope) :
            RoomDatabase.Callback() {

            override fun onOpen(db: SupportSQLiteDatabase) {
                super.onOpen(db)
                INSTANCE?.let { database ->
                    scope.launch(Dispatchers.IO) {
                        populateDatabase(database.individualDao())
                    }
                }
            }
        }

        suspend fun populateDatabase(individualDao: IndividualDao) {
            individualDao.deleteAll()
            val item = Individual("1", "Gion", "21", "Cluj", false,  2001)
            individualDao.insert(item)
        }
    }

}
