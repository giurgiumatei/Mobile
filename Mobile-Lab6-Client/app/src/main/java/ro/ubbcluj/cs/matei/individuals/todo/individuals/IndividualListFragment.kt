package ro.ubbcluj.cs.matei.individuals.todo.individuals

import android.animation.ObjectAnimator
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import kotlinx.android.synthetic.main.fragment_individual_list.*
import ro.ubbcluj.cs.matei.individuals.R
import ro.ubbcluj.cs.matei.individuals.auth.data.AuthRepository
import ro.ubbcluj.cs.matei.individuals.core.TAG

class IndividualListFragment : Fragment() {
    private lateinit var individualListAdapter: IndividualListAdapter
    private lateinit var individualsModel: IndividualListViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.v(TAG, "onCreate")
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_individual_list, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        Log.v(TAG, "onActivityCreated")
        if (!AuthRepository.isLoggedIn) {
            findNavController().navigate(R.id.fragment_login)
            return;
        }
        setupIndividualList()
        fab.setOnClickListener {
            Log.v(TAG, "add new individual")
            findNavController().navigate(R.id.fragment_individual_edit)
        }
    }

    private fun setupIndividualList() {
        individualListAdapter = IndividualListAdapter(this)
        individual_list.adapter = individualListAdapter
        individualsModel = ViewModelProvider(this).get(IndividualListViewModel::class.java)
        individualsModel.individuals.observe(viewLifecycleOwner, { individuals ->
            Log.v(TAG, "update individuals")
            individualListAdapter.individuals = individuals
        })
        individualsModel.loading.observe(viewLifecycleOwner, { loading ->
            Log.i(TAG, "update loading")
            progress.visibility = if (loading) View.VISIBLE else View.GONE
        })
        individualsModel.loadingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.i(TAG, "update loading error")
                val message = "Loading exception ${exception.message}"
                Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
            }
        })
        individualsModel.refresh()
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        revealAndHideView()
        changeViewPositionByObjectAnimator()
    }

    private fun changeViewPositionByObjectAnimator() {
        ObjectAnimator.ofFloat(view, "translationY", 50f).apply {
            duration = 5000
            start()
        }
    }

    private fun revealAndHideView() {
        button_reveal.setOnClickListener {
            text_title.apply {
                alpha = 0f
                visibility = View.VISIBLE
                animate()
                    .alpha(1f)
                    .setDuration(5000)
                    .setListener(null)
            }
        }
        button_hide.setOnClickListener {
            text_title.apply {
                alpha = 1f
                visibility = View.VISIBLE
                animate()
                    .alpha(0f)
                    .setDuration(5000)
                    .setListener(null)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.v(TAG, "onDestroy")
    }
}