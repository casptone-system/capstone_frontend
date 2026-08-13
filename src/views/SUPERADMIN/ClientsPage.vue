<template>
    <section class="college-shell">

      <!-- =====================================================
           PAGE HEADER
      ====================================================== -->
      <div class="college-header">
        <div>
          <p class="eyebrow">Colleges</p>

          <h1>Manage institutional colleges</h1>

          <p class="subtext">
            Review college ownership, dean assignments, program counts,
            and status in a single workspace.
          </p>
        </div>

        <div class="college-actions">
          <ion-button
            fill="outline"
            @click="reloadColleges"
          >
            Refresh
          </ion-button>

          <ion-button
            class="sa-btn-primary"
            @click="openForm"
          >
            Create College
          </ion-button>
        </div>
      </div>


      <!-- =====================================================
           STATISTICS
      ====================================================== -->
      <section class="stats-grid">

        <div class="stat-card">
          <p class="stat-label">Colleges</p>
          <p class="stat-value">
            {{ colleges.length }}
          </p>
        </div>

        <div class="stat-card">
          <p class="stat-label">Programs</p>
          <p class="stat-value">
            {{ totalPrograms }}
          </p>
        </div>

        <div class="stat-card">
          <p class="stat-label">Deans</p>
          <p class="stat-value">
            {{ deanCount }}
          </p>
        </div>

        <div class="stat-card">
          <p class="stat-label">Active</p>
          <p class="stat-value">
            {{ activeCollegeCount }}
          </p>
        </div>

      </section>


      <!-- =====================================================
           COLLEGES TABLE
      ====================================================== -->
      <section class="table-card">

        <div class="table-card-header">
          <div>
            <h2>Colleges</h2>

            <p>
              Each college can be viewed, edited, and managed
              in more detail.
            </p>
          </div>
        </div>


        <div class="table-wrapper">

          <div class="table-row header">
            <span>College</span>
            <span>Dean</span>
            <span>Programs</span>
            <span>Status</span>
            <span>Actions</span>
          </div>


          <div
            v-for="college in colleges"
            :key="college.id"
            class="table-row"
          >
            <span class="college-name">
              {{ college.name }}
            </span>

            <span>
              {{ getDeanName(college.id) }}
            </span>

            <span>
              {{ college.programs?.length || 0 }}
            </span>

            <span>
              <span class="status-pill">
                Active
              </span>
            </span>

            <span class="row-actions">

              <ion-button
                fill="clear"
                size="small"
                @click="viewCollege(college.id)"
              >
                View
              </ion-button>

              <ion-button
                fill="clear"
                size="small"
                @click="prepareEdit(college)"
              >
                Edit
              </ion-button>

              <ion-button
                fill="clear"
                size="small"
                color="danger"
                @click="confirmDelete(college)"
              >
                Delete
              </ion-button>

            </span>
          </div>


          <div
            v-if="!colleges.length"
            class="empty-state"
          >
            <strong>No colleges available</strong>

            <span>
              Click Create College to create the first
              institutional college.
            </span>

            <ion-button
              class="sa-btn-primary"
              @click="openForm"
            >
              Create College
            </ion-button>
          </div>

        </div>
      </section>


      <!-- =====================================================
           CREATE / EDIT COLLEGE MODAL
           
           AppModal uses v-model:modelValue.
      ====================================================== -->
      <AppModal
        v-model="showForm"
        :title="
          editingCollege
            ? 'Edit College'
            : 'Create College'
        "
        :subtitle="
          editingCollege
            ? 'Update the institutional college details.'
            : 'Create a college and establish its Dean ownership.'
        "
      >

        <div class="modal-content">

          <!-- COLLEGE INFORMATION -->
          <div class="form-section-title">
            College Information
          </div>

          <div class="form-grid">

            <label>
              <span>
                College name
                <strong class="required">*</strong>
              </span>

              <input
                v-model="form.name"
                type="text"
                placeholder="College of Engineering"
                autocomplete="organization"
              />
            </label>


            <label>
              <span>
                Code
                <strong class="required">*</strong>
              </span>

              <input
                v-model="form.code"
                type="text"
                placeholder="ENG"
                autocomplete="off"
              />
            </label>


            <label class="full">
              <span>Description</span>

              <textarea
                v-model="form.description"
                rows="4"
                placeholder="Describe the college."
              ></textarea>
            </label>

          </div>


          <!-- DEAN OWNERSHIP -->
          <div class="form-section-title dean-section-title">
            Dean / Ownership
          </div>

          <p class="section-help">
            Assign the person responsible for this college.
            If no Dean is provided, the college can remain
            unassigned until one is appointed.
          </p>


          <div class="form-grid">

            <label>
              <span>Dean name</span>

              <input
                v-model="form.dean_name"
                type="text"
                placeholder="Dr. Jane Smith"
                autocomplete="name"
              />
            </label>


            <label>
              <span>Dean email</span>

              <input
                v-model="form.dean_email"
                type="email"
                placeholder="dean@example.edu"
                autocomplete="email"
              />
            </label>


            <div class="full dean-option">

              <input
                id="autoCreateDean"
                v-model="form.dean_auto_create"
                type="checkbox"
              />

              <label for="autoCreateDean">
                <strong>
                  Automatically create Dean account
                </strong>

                <span>
                  If disabled, the Dean will receive an
                  invitation instead.
                </span>
              </label>

            </div>

          </div>

        </div>


        <!-- MODAL FOOTER -->
        <template #footer>

          <div class="modal-footer-actions">

            <ion-button
              fill="outline"
              @click="cancelForm"
            >
              Cancel
            </ion-button>

            <ion-button
              class="sa-btn-primary"
              :disabled="
                !form.name.trim() ||
                !form.code.trim()
              "
              @click="submitForm"
            >
              {{
                editingCollege
                  ? 'Save Changes'
                  : 'Create College'
              }}
            </ion-button>

          </div>

        </template>

      </AppModal>


      <!-- =====================================================
           DELETE CONFIRMATION
      ====================================================== -->
      <div
        v-if="deleteTarget"
        class="delete-modal-backdrop"
        @click.self="cancelDelete"
      >

        <div
          class="delete-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >

          <div
            class="delete-modal-icon"
            aria-hidden="true"
          >
            <span>!</span>
          </div>


          <div class="delete-modal-content">

            <p class="delete-modal-eyebrow">
              DELETE COLLEGE
            </p>

            <h3 id="delete-modal-title">
              Are you sure?
            </h3>

            <p>
              You are about to permanently delete
              <strong>{{ deleteTarget.name }}</strong>.
              This action cannot be undone.
            </p>

          </div>


          <div class="delete-modal-actions">

            <button
              type="button"
              class="modal-btn modal-btn-secondary"
              :disabled="isDeleting"
              @click="cancelDelete"
            >
              Cancel
            </button>

            <button
              type="button"
              class="modal-btn modal-btn-danger"
              :disabled="isDeleting"
              @click="deleteConfirmed"
            >

              <span
                v-if="isDeleting"
                class="delete-spinner"
              ></span>

              {{
                isDeleting
                  ? 'Deleting…'
                  : 'Delete College'
              }}

            </button>

          </div>

        </div>

      </div>

    </section>
</template>


<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { IonButton } from '@ionic/vue'
import { useRouter } from 'vue-router'

import AppModal from '@/components/AppModal.vue'

import {
  createCollege,
  deleteCollege,
  getColleges,
  getUsers,
  updateCollege,
} from '@/lib/api'


const router = useRouter()


/* ============================================================
   STATE
============================================================ */

const colleges = ref<any[]>([])
const users = ref<any[]>([])

const showForm = ref(false)
const editingCollege = ref<any | null>(null)

const deleteTarget = ref<any | null>(null)
const isDeleting = ref(false)


/* ============================================================
   FORM
============================================================ */

const createEmptyForm = () => ({
  name: '',
  code: '',
  description: '',
  dean_name: '',
  dean_email: '',
  dean_auto_create: true,
})

const form = ref(createEmptyForm())


/* ============================================================
   COMPUTED STATISTICS
============================================================ */

const totalPrograms = computed(() =>
  colleges.value.reduce(
    (sum, college) =>
      sum + (college.programs?.length || 0),
    0,
  ),
)


const deanCount = computed(() =>
  users.value.filter(
    (user) =>
      String(user.role || '')
        .toLowerCase()
        .includes('dean') &&
      user.college_id != null,
  ).length,
)


const activeCollegeCount = computed(
  () => colleges.value.length,
)


/* ============================================================
   LOAD COLLEGES
============================================================ */

const loadColleges = async () => {
  try {
    const response = await getColleges()

    let items: any[] = []

    if (Array.isArray(response)) {
      items = response
    } else if (Array.isArray(response?.data)) {
      items = response.data
    } else if (
      Array.isArray(response?.data?.data)
    ) {
      items = response.data.data
    } else if (response?.id) {
      items = [response]
    }

    colleges.value = items
  } catch (error) {
    console.error(
      'Failed to load colleges',
      error,
    )
  }
}


/* ============================================================
   LOAD USERS
============================================================ */

const loadUsers = async () => {
  try {
    const response = await getUsers()

    let items: any[] = []

    if (Array.isArray(response)) {
      items = response
    } else if (Array.isArray(response?.data)) {
      items = response.data
    } else if (
      Array.isArray(response?.data?.users)
    ) {
      items = response.data.users
    } else if (
      Array.isArray(response?.users)
    ) {
      items = response.users
    }

    users.value = items
  } catch (error) {
    console.error(
      'Failed to load users',
      error,
    )
  }
}


/* ============================================================
   RELOAD
============================================================ */

const reloadColleges = async () => {
  await Promise.all([
    loadColleges(),
    loadUsers(),
  ])
}


/* ============================================================
   CREATE
============================================================ */

const openForm = () => {
  editingCollege.value = null

  form.value = createEmptyForm()

  showForm.value = true
}


/* ============================================================
   CANCEL FORM
============================================================ */

const cancelForm = () => {
  showForm.value = false

  editingCollege.value = null

  form.value = createEmptyForm()
}


/* ============================================================
   EDIT
============================================================ */

const prepareEdit = (college: any) => {
  editingCollege.value = college

  form.value = {
    name: college.name || '',
    code: college.code || '',
    description: college.description || '',
    dean_name: college.dean_name || '',
    dean_email: college.dean_email || '',
    dean_auto_create: false,
  }

  showForm.value = true
}


/* ============================================================
   SAVE / CREATE
============================================================ */

const submitForm = async () => {
  const name = form.value.name.trim()
  const code = form.value.code.trim()

  if (!name || !code) {
    return
  }

  try {

    /* --------------------------------------------------------
       EDIT EXISTING COLLEGE
    --------------------------------------------------------- */

    if (editingCollege.value) {

      await updateCollege(
        editingCollege.value.id,
        {
          name,
          code,
          description:
            form.value.description.trim(),
        },
      )

    }

    /* --------------------------------------------------------
       CREATE NEW COLLEGE
    --------------------------------------------------------- */

    else {

      const payload: any = {
        name,
        code,
        description:
          form.value.description.trim(),
      }


      /*
       * Dean information is included only when
       * an email has been supplied.
       */

      if (form.value.dean_email.trim()) {

        payload.dean = {
          name:
            form.value.dean_name.trim() ||
            undefined,

          email:
            form.value.dean_email.trim(),

          auto_create:
            Boolean(
              form.value.dean_auto_create,
            ),
        }

      }


      await createCollege(payload)

    }


    /* --------------------------------------------------------
       REFRESH TABLE
    --------------------------------------------------------- */

    await reloadColleges()

    cancelForm()

  } catch (error: any) {

    console.error(
      'Failed to save college',
      error,
    )


    const msg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to save college'


    try {

      const { useToastStore } =
        await import(
          '@/stores/toastStore'
        )

      useToastStore().show(
        msg,
        'error',
      )

    } catch (toastError) {

      console.debug(
        'Unable to show save-error toast:',
        toastError,
      )

    }

  }
}


/* ============================================================
   DELETE
============================================================ */

const confirmDelete = (college: any) => {
  deleteTarget.value = college
}


const cancelDelete = () => {
  if (isDeleting.value) {
    return
  }

  deleteTarget.value = null
}


const deleteConfirmed = async () => {

  if (
    !deleteTarget.value?.id ||
    isDeleting.value
  ) {
    return
  }


  isDeleting.value = true


  try {

    await deleteCollege(
      deleteTarget.value.id,
    )

    deleteTarget.value = null

    await reloadColleges()

  } catch (error: any) {

    console.error(
      'Failed to delete college',
      error,
    )


    const msg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to delete college'


    try {

      const { useToastStore } =
        await import(
          '@/stores/toastStore'
        )

      useToastStore().show(
        msg,
        'error',
      )

    } catch (toastError) {

      console.debug(
        'Unable to show delete-error toast:',
        toastError,
      )

    }

  } finally {

    isDeleting.value = false

  }
}


/* ============================================================
   DEAN DISPLAY
============================================================ */

const getDeanName = (
  collegeId: number | string,
) => {

  const dean = users.value.find(
    (user) =>
      String(user.role || '')
        .toLowerCase()
        .includes('dean') &&
      Number(user.college_id) ===
        Number(collegeId),
  )


  return dean?.name || 'Unassigned'
}


/* ============================================================
   VIEW COLLEGE
============================================================ */

const viewCollege = (
  id: number | string,
) => {
  void router.push(
    `/superadmin/colleges/${id}`,
  )
}


/* ============================================================
   INITIAL LOAD
============================================================ */

onMounted(() => {
  void reloadColleges()
})
</script>


<style scoped>

/* ============================================================
   PAGE
============================================================ */

.college-shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  padding: 1.25rem;

  background: #f8fafc;
  color: #0f172a;
}


/* ============================================================
   HEADER
============================================================ */

.college-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 1rem;

  padding: 1.25rem;

  border: 1px solid #e2e8f0;
  border-radius: 1rem;

  background: #fff;

  box-shadow:
    0 6px 20px
    rgba(15, 23, 42, 0.05);
}


.eyebrow {
  margin: 0 0 0.25rem;

  color: #0f766e;

  font-size: 0.74rem;
  font-weight: 800;

  letter-spacing: 0.16em;
  text-transform: uppercase;
}


.college-header h1 {
  margin: 0;

  font-size: 1.5rem;
}


.subtext {
  margin: 0.45rem 0 0;

  color: #64748b;

  line-height: 1.5;
}


.college-actions {
  display: flex;
  gap: 0.6rem;

  flex-wrap: wrap;
}


/* ============================================================
   PRIMARY BUTTON
============================================================ */

.sa-btn-primary {
  --background: #0f766e;
  --background-hover: #115e59;
  --color: #fff;
}


/* ============================================================
   STATISTICS
============================================================ */

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 0.75rem;
}


.stat-card {
  padding: 1rem;

  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;

  background: #fff;

  box-shadow:
    0 4px 16px
    rgba(15, 23, 42, 0.04);
}


.stat-label {
  margin: 0;

  color: #64748b;

  font-size: 0.76rem;
  font-weight: 700;
}


.stat-value {
  margin: 0.3rem 0 0;

  color: #0f172a;

  font-size: 1.4rem;
  font-weight: 800;
}


/* ============================================================
   TABLE
============================================================ */

.table-card {
  padding: 1rem;

  border: 1px solid #e2e8f0;
  border-radius: 1rem;

  background: #fff;

  box-shadow:
    0 6px 20px
    rgba(15, 23, 42, 0.04);
}


.table-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 1rem;

  margin-bottom: 0.9rem;
}


.table-card-header h2 {
  margin: 0;
}


.table-card-header p {
  margin: 0.3rem 0 0;

  color: #64748b;

  font-size: 0.82rem;
}


.table-wrapper {
  overflow-x: auto;
}


.table-row {
  min-width: 760px;

  display: grid;

  grid-template-columns:
    1.4fr
    1.1fr
    0.75fr
    0.7fr
    1.7fr;

  gap: 0.75rem;

  align-items: center;

  padding: 0.8rem 0;

  border-bottom: 1px solid #f1f5f9;

  font-size: 0.82rem;
}


.table-row.header {
  color: #64748b;

  font-size: 0.7rem;
  font-weight: 800;

  text-transform: uppercase;
  letter-spacing: 0.06em;
}


.college-name {
  color: #0f172a;
  font-weight: 700;
}


.status-pill {
  display: inline-flex;
  align-items: center;

  padding: 0.25rem 0.55rem;

  border-radius: 999px;

  background: #ecfdf5;
  color: #166534;

  font-size: 0.7rem;
  font-weight: 800;
}


.row-actions {
  display: flex;
  gap: 0.2rem;

  flex-wrap: wrap;
}


/* ============================================================
   EMPTY
============================================================ */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 0.5rem;

  padding: 2.5rem 1rem;

  color: #64748b;

  text-align: center;
}


.empty-state strong {
  color: #334155;

  font-size: 0.95rem;
}


/* ============================================================
   CREATE / EDIT FORM
============================================================ */

.modal-content {
  display: flex;
  flex-direction: column;

  gap: 0.9rem;
}


.form-section-title {
  margin-top: 0.25rem;

  padding-bottom: 0.45rem;

  border-bottom: 1px solid #e2e8f0;

  color: #0f766e;

  font-size: 0.72rem;
  font-weight: 800;

  letter-spacing: 0.12em;
  text-transform: uppercase;
}


.dean-section-title {
  margin-top: 0.65rem;
}


.section-help {
  margin: -0.35rem 0 0;

  color: #64748b;

  font-size: 0.8rem;

  line-height: 1.45;
}


.form-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 0.75rem;
}


.form-grid > label {
  display: flex;
  flex-direction: column;

  gap: 0.3rem;

  color: #334155;

  font-size: 0.86rem;
  font-weight: 700;
}


.form-grid > label.full {
  grid-column: 1 / -1;
}


.form-grid input,
.form-grid textarea {
  box-sizing: border-box;

  width: 100%;

  padding: 0.7rem 0.75rem;

  border: 1px solid #cbd5e1;
  border-radius: 0.7rem;

  background: #f8fafc;

  font: inherit;
  color: #0f172a;

  outline: none;

  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}


.form-grid input:focus,
.form-grid textarea:focus {
  border-color: #0f766e;

  background: #fff;

  box-shadow:
    0 0 0 3px
    rgba(15, 118, 110, 0.12);
}


.form-grid textarea {
  resize: vertical;
}


.required {
  color: #dc2626;
}


.dean-option {
  display: flex;
  align-items: flex-start;

  gap: 0.65rem;

  padding: 0.8rem;

  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;

  background: #f8fafc;
}


.dean-option > input {
  width: auto;

  margin-top: 0.2rem;
}


.dean-option label {
  display: flex;
  flex-direction: column;

  gap: 0.2rem;

  color: #334155;

  font-size: 0.82rem;

  cursor: pointer;
}


.dean-option label span {
  color: #64748b;

  font-size: 0.74rem;

  font-weight: 500;
}


/* ============================================================
   MODAL FOOTER
============================================================ */

.modal-footer-actions {
  display: flex;
  justify-content: flex-end;

  gap: 0.6rem;

  width: 100%;
}


/* ============================================================
   DELETE MODAL
============================================================ */

.delete-modal-backdrop {
  position: fixed;

  inset: 0;

  z-index: 2000;

  display: grid;

  place-items: center;

  padding: 1rem;

  background:
    rgba(15, 23, 42, 0.52);

  backdrop-filter: blur(4px);
}


.delete-modal {
  width: min(460px, 100%);

  padding: 1.35rem;

  border: 1px solid #e2e8f0;
  border-radius: 1.1rem;

  background: #fff;

  box-shadow:
    0 24px 70px
    rgba(15, 23, 42, 0.22);

  animation:
    deleteModalIn
    0.18s
    ease-out;
}


.delete-modal-icon {
  width: 48px;
  height: 48px;

  display: grid;

  place-items: center;

  margin-bottom: 0.9rem;

  border-radius: 50%;

  background: #fff1f2;

  color: #e11d48;

  font-size: 1.25rem;
  font-weight: 900;
}


.delete-modal-icon span {
  width: 26px;
  height: 26px;

  display: grid;

  place-items: center;

  border-radius: 50%;

  border: 2px solid currentColor;
}


.delete-modal-content {
  margin-bottom: 1.2rem;
}


.delete-modal-eyebrow {
  margin: 0 0 0.3rem;

  color: #e11d48;

  font-size: 0.68rem;
  font-weight: 800;

  letter-spacing: 0.13em;
}


.delete-modal-content h3 {
  margin: 0;

  color: #0f172a;

  font-size: 1.2rem;
}


.delete-modal-content p:last-child {
  margin: 0.5rem 0 0;

  color: #64748b;

  line-height: 1.55;

  font-size: 0.86rem;
}


.delete-modal-content strong {
  color: #334155;
}


.delete-modal-actions {
  display: flex;

  justify-content: flex-end;

  gap: 0.55rem;
}


.modal-btn {
  min-height: 42px;

  padding: 0 0.95rem;

  border-radius: 0.65rem;

  font: inherit;
  font-weight: 800;

  cursor: pointer;

  transition: 0.18s ease;
}


.modal-btn:disabled {
  opacity: 0.65;

  cursor: not-allowed;
}


.modal-btn-secondary {
  border: 1px solid #cbd5e1;

  background: #fff;

  color: #334155;
}


.modal-btn-secondary:hover:not(:disabled) {
  background: #f8fafc;
}


.modal-btn-danger {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 0.45rem;

  border: 1px solid #e11d48;

  background: #e11d48;

  color: #fff;
}


.modal-btn-danger:hover:not(:disabled) {
  background: #be123c;

  border-color: #be123c;
}


.delete-spinner {
  width: 13px;
  height: 13px;

  border: 2px solid
    rgba(255, 255, 255, 0.35);

  border-top-color: #fff;

  border-radius: 50%;

  animation:
    deleteSpin
    0.7s
    linear
    infinite;
}


/* ============================================================
   ANIMATIONS
============================================================ */

@keyframes deleteSpin {
  to {
    transform: rotate(360deg);
  }
}


@keyframes deleteModalIn {
  from {
    opacity: 0;

    transform:
      translateY(8px)
      scale(0.98);
  }

  to {
    opacity: 1;

    transform:
      translateY(0)
      scale(1);
  }
}


/* ============================================================
   RESPONSIVE
============================================================ */

@media (max-width: 900px) {

  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

}


@media (max-width: 700px) {

  .college-header {
    flex-direction: column;
  }


  .stats-grid {
    grid-template-columns: 1fr;
  }


  .form-grid {
    grid-template-columns: 1fr;
  }


  .form-grid > label.full {
    grid-column: auto;
  }


  .modal-footer-actions {
    flex-direction: column-reverse;
  }


  .modal-footer-actions ion-button {
    width: 100%;
  }

}
</style>