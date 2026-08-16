<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="program-management-shell">
        <header class="program-management-header">
          <button type="button" class="program-back-btn" @click="goBack">
            <ion-icon :icon="arrowBackOutline" />
            Back to dashboard
          </button>
        </header>

        <div v-if="loading" class="program-empty">Loading program details…</div>
        <div v-else-if="error" class="program-empty error">{{ error }}</div>

        <div v-else class="program-workbench">
          <div class="program-main-header">
            <p class="program-kicker">Program management</p>
            <h1>{{ program?.name || 'Program details' }}</h1>
            <p v-if="program?.code" class="program-header-code">Program code: {{ program.code }}</p>
          </div>

          <section class="program-summary-card">
            <div class="program-summary-label-row">
              <div class="program-summary-icon">
                <ion-icon :icon="schoolOutline" />
              </div>
              <div>
                <p class="program-card-label">Program summary</p>
                <h2>{{ program?.name || 'Program' }}</h2>
              </div>
            </div>

            <div class="program-summary-grid">
              <div class="program-summary-item">
                <span>Program code</span>
                <strong>{{ program?.code || 'Not assigned' }}</strong>
              </div>
              <div class="program-summary-item">
                <span>Chair</span>
                <strong>{{ programChairName }}</strong>
              </div>
              <div class="program-summary-item">
                <span>College</span>
                <strong>{{ programCollegeName }}</strong>
              </div>
              <div class="program-summary-item">
                <span>Compliance</span>
                <strong>{{ programCompliance }}%</strong>
              </div>
            </div>
          </section>

          <div class="program-workbench-grid">
            <aside class="program-side-panel">
              <div class="program-card program-side-card">
                <div class="program-card-header compact">
                  <div class="program-card-icon blue">
                    <ion-icon :icon="personAddOutline" />
                  </div>
                  <div>
                    <p class="program-card-label">Edit chair assignment</p>
                    <h2>Chair assignment</h2>
                  </div>
                </div>

                <label class="program-field">
                  <span>Available chair</span>
                  <select v-model="selectedChairId">
                    <option value="">Select a program chair</option>
                    <option v-for="person in chairOptions" :key="person.id" :value="String(person.id)">
                      {{ person.name }} {{ person.email ? `(${person.email})` : '' }}
                    </option>
                  </select>
                </label>

                <button type="button" class="program-primary-btn" :disabled="savingChair || !selectedChairId" @click="assignChair">
                  {{ savingChair ? 'Saving...' : (program?.chairId ? 'Update chair' : 'Assign chair') }}
                </button>
              </div>
            </aside>

            <div class="program-main-column">
              <section class="program-card program-health-card">
                <div class="program-card-header compact">
                  <div class="program-card-icon amber">
                    <ion-icon :icon="schoolOutline" />
                  </div>
                  <div>
                    <p class="program-card-label">Program health</p>
                    <h2>Progress &amp; submissions</h2>
                  </div>
                </div>

                <div class="program-stats-grid">
                  <div class="program-stat-box">
                    <span>Faculty</span>
                    <strong>{{ programFacultyCount }}</strong>
                  </div>
                  <div class="program-stat-box">
                    <span>Completion</span>
                    <strong>{{ requirementCompletionRate }}%</strong>
                  </div>
                  <div class="program-stat-box">
                    <span>Total documents</span>
                    <strong>{{ totalDocuments }}</strong>
                  </div>
                  <div class="program-stat-box">
                    <span>Pending review</span>
                    <strong>{{ pendingReviewDocuments }}</strong>
                  </div>
                </div>
              </section>

              <section class="program-card program-faculty-card">
                <div class="program-card-header compact">
                  <div class="program-card-icon green">
                    <ion-icon :icon="peopleOutline" />
                  </div>
                  <div>
                    <p class="program-card-label">Add faculty</p>
                    <h2>Send faculty invitation</h2>
                  </div>
                </div>

                <label class="program-field">
                  <span>Faculty email</span>
                  <input v-model="facultyEmail" type="email" placeholder="faculty@example.com" />
                </label>

                <button type="button" class="program-primary-btn" :disabled="sendingInvite || !facultyEmail.trim()" @click="addFaculty">
                  {{ sendingInvite ? 'Sending...' : 'Add faculty' }}
                </button>

                <div v-if="invitedFaculty.length" class="program-inline-list">
                  <p class="program-section-title">Pending faculty invites</p>
                  <div v-for="member in invitedFaculty" :key="member.id || member.email" class="program-pill">
                    {{ member.email || member.name || 'Faculty invite' }}
                  </div>
                </div>

                <div v-if="pendingMembershipRequests.length" class="program-inline-list program-inline-list-stack">
                  <p class="program-section-title">Membership approvals</p>
                  <div v-for="request in pendingMembershipRequests" :key="request.id || request.token || request.email" class="program-approval-row">
                    <span>{{ request.email || request.name || 'Faculty request' }}</span>
                    <button type="button" class="program-primary-btn program-mini-btn" :disabled="approvingRequestToken === (request.token || request.id)" @click="approveMembershipRequest(request)">
                      {{ approvingRequestToken === (request.token || request.id) ? 'Approving...' : 'Approve' }}
                    </button>
                  </div>
                </div>
              </section>

              <section class="program-card program-faculty-card">
                <div class="program-card-header compact">
                  <div class="program-card-icon violet">
                    <ion-icon :icon="personOutline" />
                  </div>
                  <div>
                    <p class="program-card-label">Faculty roster</p>
                    <h2>Program members</h2>
                  </div>
                </div>

                <div v-if="facultyMembers.length" class="program-member-list">
                  <div v-for="member in facultyMembers" :key="member.id || member.email || member.name" class="program-member-row">
                    <div v-if="member.profilePhoto" class="program-member-avatar-wrap">
                      <img :src="member.profilePhoto" :alt="member.name || member.email || 'Faculty profile'" class="program-member-avatar" />
                    </div>
                    <div v-else class="program-member-badge">{{ getInitials(member.name || member.email) }}</div>
                    <div>
                      <strong>{{ member.name || member.email }}</strong>
                      <small>{{ member.email || 'Faculty member' }}</small>
                    </div>
                    <button
                      type="button"
                      class="program-remove-btn"
                      :disabled="removingMemberId === (member.id || member.email)"
                      @click="removeFaculty(member)"
                    >
                      {{ removingMemberId === (member.id || member.email) ? 'Removing...' : 'Remove' }}
                    </button>
                  </div>
                </div>
                <p v-else class="program-empty-light">No faculty has been assigned or invited yet.</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import {
  approveInvitationToken,
  createProgramInvitation,
  getProgram,
  getProgramInvitations,
  getUsers,
  removeProgramMember,
  updateProgram,
} from '@/lib/api'
import {
  arrowBackOutline,
  peopleOutline,
  personAddOutline,
  personOutline,
  schoolOutline,
} from 'ionicons/icons'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(false)
const error = ref('')
const program = ref<any>(null)
const users = ref<any[]>([])
const invitedFaculty = ref<any[]>([])
const pendingMembershipRequests = ref<any[]>([])
const selectedChairId = ref('')
const facultyEmail = ref('')
const savingChair = ref(false)
const sendingInvite = ref(false)
const approvingRequestToken = ref<string | number | null>(null)
const removingMemberId = ref<number | string | null>(null)

const programId = computed(() => String(route.params.programId || ''))
const currentUser: any = authStore.user || {}

const programCollegeName = computed(() => {
  const programCollege = program.value?.college?.name || program.value?.collegeName || null
  if (programCollege) return programCollege

  const authCollege = currentUser?.college?.name || currentUser?.college_name || currentUser?.department || null
  return authCollege || 'Assigned college'
})

const programChairName = computed(() => {
  if (program.value?.chairUser?.name) return program.value.chairUser.name
  if (program.value?.chair) return program.value.chair
  if (program.value?.chair_name) return program.value.chair_name
  return 'Unassigned'
})

const programCompliance = computed(() => Number(program.value?.complianceScore ?? program.value?.compliance_score ?? 0))
const programFacultyCount = computed(() => Number(program.value?.facultyCount ?? facultyMembers.value.length ?? 0))
const requirementCompletionRate = computed(() => Number(program.value?.requirementProgress?.completionRate ?? 0))
const totalDocuments = computed(() => Number(program.value?.submissionStats?.totalDocuments ?? 0))
const pendingReviewDocuments = computed(() => Number(program.value?.submissionStats?.pendingReviewDocuments ?? 0))

const chairOptions = computed(() => {
  if (!users.value.length) return []

  const targetCollegeId = Number(program.value?.collegeId ?? program.value?.college_id ?? 0)

  return users.value.filter((user: any) => {
    const role = String(user.role || user.roles?.[0] || '').toLowerCase()
    const userCollegeId = Number(user.college_id ?? user.collegeId ?? user.college?.id ?? 0)

    return (role.includes('program chair') || role.includes('faculty')) && (!targetCollegeId || userCollegeId === targetCollegeId)
  })
})

const resolveUserImageUrl = (value: unknown): string | null => {
  if (!value || typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('data:') || /^https?:\/\//i.test(trimmed)) return trimmed

  const rawBase = process.env.VUE_APP_API_BASE_URL || '/api'
  const backendOrigin = rawBase.replace(/\/api\/?$/, '')

  if (trimmed.startsWith('/')) return `${backendOrigin}${trimmed}`
  if (trimmed.includes('/storage/')) return trimmed
  if (trimmed.startsWith('storage/')) return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`

  return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`
}

const facultyMembers = computed(() => {
  const rawMembers = Array.isArray(program.value?.faculty) && program.value.faculty.length
    ? program.value.faculty
    : []

  if (rawMembers.length) {
    return rawMembers.map((person: any) => ({
      id: person.id,
      name: person.name || person.email || 'Faculty member',
      email: person.email,
      profilePhoto: resolveUserImageUrl(
        person.profilePhoto ||
        person.profilePhotoPath ||
        person.profile_photo ||
        person.avatar ||
        person.photo_url ||
        person.image_url ||
        null,
      ),
    }))
  }

  const members: any[] = []

  for (const person of users.value) {
    const role = String(person.role || person.roles?.[0] || '').toLowerCase()
    if (role.includes('faculty')) {
      const targetCollegeId = Number(program.value?.collegeId ?? program.value?.college_id ?? 0)
      const personCollegeId = Number(person.college_id ?? person.collegeId ?? person.college?.id ?? 0)
      if (!targetCollegeId || personCollegeId === targetCollegeId) {
        members.push({
          ...person,
          profilePhoto: resolveUserImageUrl(
            person.profilePhoto ||
            person.profilePhotoPath ||
            person.profile_photo ||
            person.avatar ||
            person.photo_url ||
            person.image_url ||
            null,
          ),
        })
      }
    }
  }

  return members
})

const getInitials = (value: string) => {
  if (!value) return 'F'

  const parts = value.split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('')
  return initials || 'F'
}

const goBack = () => {
  router.push('/user/dashboard/dean')
}

const loadProgramDetail = async () => {
  if (!programId.value) {
    error.value = 'No program selected.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const [programResponse, usersResponse] = await Promise.all([
      getProgram(programId.value),
      getUsers(),
    ])

    const currentProgram = programResponse?.data ?? programResponse ?? null
    program.value = currentProgram

    const allUsers = Array.isArray(usersResponse?.data?.users)
      ? usersResponse.data.users
      : Array.isArray(usersResponse?.users)
        ? usersResponse.users
        : Array.isArray(usersResponse)
          ? usersResponse
          : []

    users.value = allUsers

    if (currentProgram?.chairId) {
      selectedChairId.value = String(currentProgram.chairId)
    } else {
      selectedChairId.value = ''
    }

    const invitationsResponse = await getProgramInvitations(programId.value)
    const invitationList = Array.isArray(invitationsResponse?.data)
      ? invitationsResponse.data
      : Array.isArray(invitationsResponse)
        ? invitationsResponse
        : []

    invitedFaculty.value = invitationList.filter((invite: any) => {
      const role = String(invite.role || '').toLowerCase()
      const status = String(invite.status || '').toLowerCase()
      return status !== 'requested' && (role.includes('faculty') || (!invite.role && !!invite.email))
    })
    pendingMembershipRequests.value = invitationList.filter((invite: any) => String(invite.status || '').toLowerCase() === 'requested')
  } catch (requestError: any) {
    console.warn('Unable to load program detail:', requestError)
    error.value = requestError?.response?.data?.message || 'Unable to load this program.'
  } finally {
    loading.value = false
  }
}

const assignChair = async () => {
  if (!programId.value || !selectedChairId.value) {
    toastStore.show('Please select a chair first.', 'error')
    return
  }

  savingChair.value = true

  try {
    const chosenUser = users.value.find((user: any) => String(user.id) === String(selectedChairId.value))
    const payload = { chair_id: Number(selectedChairId.value) }

    await updateProgram(programId.value, payload)
    program.value = {
      ...program.value,
      chairId: Number(selectedChairId.value),
      chair: chosenUser?.name || programChairName.value,
      chairUser: chosenUser || program.value?.chairUser,
    }

    toastStore.show(`${chosenUser?.name || 'Chair'} assigned to ${program.value?.name || 'this program'}.`, 'success')
  } catch (requestError: any) {
    console.warn('Unable to assign program chair:', requestError)
    toastStore.show(requestError?.response?.data?.message || 'Unable to assign the chair right now.', 'error')
  } finally {
    savingChair.value = false
  }
}

const addFaculty = async () => {
  const email = facultyEmail.value.trim()
  if (!programId.value || !email) {
    toastStore.show('Please enter a faculty email.', 'error')
    return
  }

  sendingInvite.value = true

  try {
    await createProgramInvitation(programId.value, {
      email,
      role: 'faculty',
      expires_in_hours: 72,
    })

    facultyEmail.value = ''
    await loadProgramDetail()
    toastStore.show(`Faculty invite sent to ${email}.`, 'success')
  } catch (requestError: any) {
    console.warn('Unable to invite faculty:', requestError)
    toastStore.show(requestError?.response?.data?.message || 'Unable to send the invitation right now.', 'error')
  } finally {
    sendingInvite.value = false
  }
}

const approveMembershipRequest = async (request: any) => {
  const token = request?.token
  if (!token) {
    toastStore.show('No approval token was provided for this request.', 'error')
    return
  }

  approvingRequestToken.value = token

  try {
    await approveInvitationToken(token)
    await loadProgramDetail()
    toastStore.show(`${request?.email || request?.name || 'Faculty member'} was approved into this program.`, 'success')
  } catch (requestError: any) {
    console.warn('Unable to approve program membership request:', requestError)
    toastStore.show(requestError?.response?.data?.message || 'Unable to approve this request right now.', 'error')
  } finally {
    approvingRequestToken.value = null
  }
}

const removeFaculty = async (member: any) => {
  if (!programId.value) return

  const memberId = member?.id ?? member?.user_id ?? member?.email
  if (!memberId) return

  removingMemberId.value = memberId

  try {
    await removeProgramMember(programId.value, memberId)
    await loadProgramDetail()
    toastStore.show(`${member?.name || member?.email || 'Faculty member'} removed from this program.`, 'success')
  } catch (requestError: any) {
    console.warn('Unable to remove faculty member:', requestError)
    toastStore.show(requestError?.response?.data?.message || 'Unable to remove the faculty member right now.', 'error')
  } finally {
    removingMemberId.value = null
  }
}

onMounted(() => {
  void loadProgramDetail()
})
</script>

<style scoped>
.program-management-shell {
  min-height: 100vh;
  background: #edf3f4;
  padding: 1.3rem 1.8rem 2.2rem;
  color: #0f172a;
}

.program-management-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 1rem;
}

.program-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  border: 1px solid rgba(148, 163, 184, 0.45);
  background: rgba(255, 255, 255, 0.6);
  padding: 0.8rem 1rem;
  border-radius: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  cursor: pointer;
}

.program-workbench {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.program-main-header {
  padding-top: 0.2rem;
}

.program-kicker {
  margin: 0;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.program-main-header h1 {
  margin: 0.25rem 0 0;
  font-size: clamp(2.2rem, 2.8vw, 3.4rem);
  line-height: 1.08;
  letter-spacing: -0.05em;
  color: #111827;
}

.program-header-code {
  margin: 0.5rem 0 0;
  font-size: 1.05rem;
  color: #475569;
}

.program-summary-card,
.program-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 1.15rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.03);
}

.program-summary-card {
  padding: 1rem 1.15rem 1.2rem;
}

.program-summary-label-row,
.program-card-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.program-summary-label-row {
  margin-bottom: 1rem;
}

.program-summary-icon,
.program-card-icon {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.8rem;
  display: grid;
  place-items: center;
  color: #1d4ed8;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  font-size: 1.1rem;
}

.program-card-icon.blue {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1d4ed8;
}

.program-card-icon.green {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #15803d;
}

.program-card-icon.violet {
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  color: #6d28d9;
}

.program-card-icon.amber {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #b45309;
}

.program-card-label {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.program-summary-label-row h2,
.program-card-header h2 {
  margin: 0.2rem 0 0;
  font-size: 1.1rem;
  letter-spacing: -0.03em;
}

.program-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: 0.9rem;
}

.program-summary-item {
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.9rem;
  padding: 0.75rem 0.8rem;
  min-height: 4.5rem;
}

.program-summary-item span {
  display: block;
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 0.4rem;
}

.program-summary-item strong {
  display: block;
  font-size: 1.05rem;
  color: #0f172a;
}

.program-workbench-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.9fr) minmax(0, 2.5fr);
  gap: 1.1rem;
  align-items: start;
}

.program-side-panel,
.program-main-column {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.program-card {
  padding: 1rem 1rem 1.1rem;
}

.program-card-header.compact {
  margin-bottom: 1rem;
}

.program-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-bottom: 0.9rem;
}

.program-field span {
  font-size: 0.77rem;
  font-weight: 700;
  color: #334155;
}

.program-field input,
.program-field select {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.45);
  border-radius: 0.8rem;
  background: #ffffff;
  padding: 0.8rem 0.9rem;
  font: inherit;
  box-sizing: border-box;
}

.program-primary-btn {
  width: 100%;
  border: none;
  border-radius: 0.8rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  padding: 0.8rem 1rem;
  font-weight: 700;
  cursor: pointer;
}

.program-primary-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.program-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(130px, 1fr));
  gap: 0.75rem;
}

.program-stat-box {
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.9rem;
  padding: 0.8rem;
  min-height: 94px;
}

.program-stat-box span {
  display: block;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: #64748b;
  margin-bottom: 0.2rem;
}

.program-stat-box strong {
  font-size: 1.45rem;
  color: #0f172a;
}

.program-inline-list,
.program-member-list {
  margin-top: 1rem;
}

.program-inline-list-stack {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.program-section-title {
  margin: 0 0 0.45rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e293b;
}

.program-approval-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.8rem;
  background: rgba(248, 250, 252, 0.9);
}

.program-approval-row span {
  font-size: 0.9rem;
}

.program-mini-btn {
  width: auto;
  min-width: 110px;
  padding: 0.55rem 0.8rem;
  font-size: 0.76rem;
}

.program-pill {
  display: inline-flex;
  align-items: center;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 0.45rem 0.7rem;
  font-size: 0.74rem;
  font-weight: 700;
  margin: 0 0.35rem 0.35rem 0;
}

.program-member-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.8rem 0.55rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.program-member-row:first-child {
  padding-top: 0.35rem;
}

.program-member-row:last-child {
  border-bottom: none;
}

.program-member-row > div:first-child {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex: 1;
}

.program-member-row strong {
  display: block;
  font-size: 0.95rem;
}

.program-member-row small {
  display: block;
  color: #64748b;
}

.program-member-badge,
.program-member-avatar-wrap {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  color: #0f172a;
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
}

.program-member-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.program-remove-btn {
  border: none;
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
  border-radius: 0.7rem;
  padding: 0.45rem 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.program-remove-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.program-empty,
.program-empty-light {
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: #334155;
}

.program-empty.error {
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #b91c1c;
  background: rgba(254, 242, 242, 0.9);
}

@media (max-width: 960px) {
  .program-workbench-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .program-management-shell {
    padding: 0.8rem;
  }

  .program-summary-grid,
  .program-stats-grid {
    grid-template-columns: 1fr;
  }

  .program-approval-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
