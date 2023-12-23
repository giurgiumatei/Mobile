package ro.ubbcluj.cs.matei.individuals.todo.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "individuals")
data class Individual(
    @PrimaryKey @ColumnInfo(name = "_id") var _id: String,
    @ColumnInfo(name = "name") var name: String,
    @ColumnInfo(name = "age") var age: String?,
    @ColumnInfo(name = "hometown") var hometown: String?,
    @ColumnInfo(name = "isVaccinated") var isVaccinated: Boolean?,
    @ColumnInfo(name = "yearOfBirth") var yearOfBirth: Int?
) {
    override fun toString(): String = name + "hometown: " + hometown
}
