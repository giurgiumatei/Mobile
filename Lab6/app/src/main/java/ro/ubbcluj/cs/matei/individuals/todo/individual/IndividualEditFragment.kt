package ro.ubbcluj.cs.matei.individuals.todo.individual

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import kotlinx.android.synthetic.main.fragment_individual_edit.*
import ro.ubbcluj.cs.matei.individuals.R
import ro.ubbcluj.cs.matei.individuals.core.TAG
import ro.ubbcluj.cs.matei.individuals.todo.data.Individual

class IndividualEditFragment : Fragment() {
    companion object {
        const val INDIVIDUAL_ID = "INDIVIDUAL_ID"
    }

    private lateinit var viewModel: IndividualEditViewModel
    private var individualId: String? = null
    private var individual: Individual? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.v(TAG, "onCreate")
        arguments?.let {
            if (it.containsKey(INDIVIDUAL_ID)) {
                individualId = it.getString(INDIVIDUAL_ID).toString()
            }
        }

    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        Log.v(TAG, "onCreateView")
        return inflater.inflate(R.layout.fragment_individual_edit, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        Log.v(TAG, "onActivityCreated")
        setupViewModel()
        fab.setOnClickListener {
            Log.v(TAG, "save individual")
            val individual = individual
            if (individual != null) {
                if (edit_name.text == null) {
                    individual.name = "none";
                } else {
                    individual.name = edit_name.text.toString()
                }
                if (edit_age.text == null) {
                    individual.age = "none";
                } else {
                    individual.age = edit_age.text.toString();
                }
                if (edit_hometown.text == null) {
                    individual.hometown = "none";
                } else {
                    individual.hometown = edit_hometown.text.toString();
                }
                individual.isVaccinated = edit_isVaccinated.isChecked;
                individual.yearOfBirth = edit_yearOfBirth.year;
                viewModel.saveOrUpdateIndividual(individual)
            }
        }

    }

    private fun setupViewModel() {
        viewModel = ViewModelProvider(this).get(IndividualEditViewModel::class.java)
        viewModel.fetching.observe(viewLifecycleOwner, { fetching ->
            Log.v(TAG, "update fetching")
            progress.visibility = if (fetching) View.VISIBLE else View.GONE
        })
        viewModel.fetchingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.v(TAG, "update fetching error")
                val message = "Fetching exception ${exception.message}"
                val parentActivity = activity?.parent
                if (parentActivity != null) {
                    Toast.makeText(parentActivity, message, Toast.LENGTH_SHORT).show()
                }
            }
        })
        viewModel.completed.observe(viewLifecycleOwner, { completed ->
            if (completed) {
                Log.v(TAG, "completed, navigate back")
                findNavController().popBackStack()
            }
        })
        val id = individualId
        if (id == null) {
            individual = Individual("", "", "", "", false, 0)
        } else {
            viewModel.getIndividualById(id).observe(viewLifecycleOwner, { individual ->
                Log.v(TAG, "update individuals")
                if (individual != null) {
                    this.individual = individual
                    edit_name.setText(individual.name)
                    edit_age.setText(individual.age)
                    edit_hometown.setText(individual.hometown)
                    edit_isVaccinated.isChecked = this.individual!!.isVaccinated == true
                    this.individual!!.yearOfBirth?.let { individual1 -> edit_yearOfBirth.updateDate(individual1,0, 1) }
                }
            })
        }
    }
}
