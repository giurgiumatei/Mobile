package ro.ubbcluj.cs.matei.individuals.todo.individuals

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.RecyclerView
import kotlinx.android.synthetic.main.view_individual.view.*
import ro.ubbcluj.cs.matei.individuals.R
import ro.ubbcluj.cs.matei.individuals.core.TAG
import ro.ubbcluj.cs.matei.individuals.todo.data.Individual
import ro.ubbcluj.cs.matei.individuals.todo.individual.IndividualEditFragment

class IndividualListAdapter(
    private val fragment: Fragment
) : RecyclerView.Adapter<IndividualListAdapter.ViewHolder>() {

    var individuals = emptyList<Individual>()
        set(value) {
            field = value
            notifyDataSetChanged();
        }

    private var onItemClick: View.OnClickListener;

    init {
        onItemClick = View.OnClickListener { view ->
            val item = view.tag as Individual
            fragment.findNavController().navigate(R.id.fragment_individual_edit, Bundle().apply {
                putString(IndividualEditFragment.INDIVIDUAL_ID, item._id)
            })
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.view_individual, parent, false)
        Log.v(TAG, "onCreateViewHolder")
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        Log.v(TAG, "onBindViewHolder $position")
        val individual = individuals[position]
        holder.itemView.tag = individual
        holder.textView.text = individual.name
        holder.itemView.setOnClickListener(onItemClick)
    }

    override fun getItemCount() = individuals.size

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textView: TextView = view.text
    }
}
