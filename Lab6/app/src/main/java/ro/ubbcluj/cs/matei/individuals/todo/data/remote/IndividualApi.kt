package ro.ubbcluj.cs.matei.individuals.todo.data.remote

import retrofit2.http.*
import ro.ubbcluj.cs.matei.individuals.core.Api
import ro.ubbcluj.cs.matei.individuals.todo.data.Individual

object IndividualApi {
    interface Service {
        @GET("/api/individual")
        suspend fun find(): List<Individual>

        @GET("/api/individual/{id}")
        suspend fun read(@Path("id") itemId: String): Individual;

        @Headers("Content-Type: application/json")
        @POST("/api/individual")
        suspend fun create(@Body individual: Individual): Individual

        @Headers("Content-Type: application/json")
        @PUT("/api/individual/{id}")
        suspend fun update(@Path("id") itemId: String, @Body individual: Individual): Individual
    }

    val service: Service = Api.retrofit.create(Service::class.java)
}