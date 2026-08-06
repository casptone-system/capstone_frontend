<template>
  <ion-page>
    <ion-content class="forgot-page">

      <div class="forgot-container">

        <div class="forgot-card">

          <img
            src="@/assets/logo-small.svg"
            alt="ADAMS Logo"
            class="logo"
          />

          <h1>Forgot Password</h1>

          <p class="subtitle">
            Enter your institutional email address and we'll send you a password reset link.
          </p>

          <form @submit.prevent="handleSubmit">

            <label>Email Address</label>

            <div class="input-wrapper">
              <ion-icon :icon="mailOutline"></ion-icon>

              <ion-input
                v-model="email"
                type="email"
                placeholder="dean@isu.edu.ph"
                class="email-input"
              />
            </div>

            <div
              v-if="message"
              class="success-message"
            >
              {{ message }}
            </div>

            <div
              v-if="error"
              class="error-message"
            >
              {{ error }}
            </div>

            <ion-button
              v-if="!isLoading"
              expand="block"
              type="submit"
              class="submit-btn"
            >
              Send Reset Link
            </ion-button>

            <ion-button
              v-else
              expand="block"
              disabled
              class="submit-btn"
            >
              <ion-spinner name="crescent"></ion-spinner>
            </ion-button>

          </form>
          <router-link
            to="/login"
            class="back-link"
          >
            ← Back to Login
          </router-link>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import api from "@/services/api";

import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonSpinner,
  IonIcon
} from "@ionic/vue";

import { mailOutline } from "ionicons/icons";

const email = ref("");
const error = ref("");
const message = ref("");
const isLoading = ref(false);

const handleSubmit = async () => {

  if (!email.value) {
    error.value = "Please enter your email address.";
    return;
  }

  error.value = "";
  message.value = "";
  isLoading.value = true;

  try {
    await api.post("/auth/forgot-password", {
      email: email.value
    });
        message.value =
          "If an account exists with this email, a password reset link has been sent.";
        email.value = "";
      } catch (err: any) {
        error.value =
          err.response?.data?.message ||
          "Unable to send reset link.";
      } finally {
        isLoading.value = false;
      }
    };
</script>

<style scoped>

.forgot-page{
    --background:#f5f7fb;
}

.forgot-container{
    min-height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
    padding:30px;
}

.forgot-card{
    width:100%;
    max-width:420px;
    background:#ffffff;
    border-radius:18px;
    padding:40px;
    box-shadow:0 15px 35px rgba(0,0,0,.08);
}

.logo{
    width:80px;
    display:block;
    margin:0 auto 20px;
}

h1{
    text-align:center;
    color:#0b5d3f;
    font-size:28px;
    margin-bottom:12px;
}

.subtitle{
    text-align:center;
    color:#6b7280;
    line-height:1.6;
    margin-bottom:30px;
}

label{
    display:block;
    margin-bottom:10px;
    font-weight:600;
    color:#374151;
}

.input-wrapper{
    display:flex;
    align-items:center;
    gap:12px;
    border:1px solid #d1d5db;
    border-radius:12px;
    padding:14px 16px;
    margin-bottom:25px;
    transition:.25s;
    background:white;
}

.input-wrapper:focus-within{
    border-color:#0b5d3f;
    box-shadow:0 0 0 4px rgba(11,93,63,.10);
}

.input-wrapper ion-icon{
    color:#6b7280;
    font-size:20px;
}

.email-input{
    flex:1;
}

.submit-btn{
    --background:#0b5d3f;
    --border-radius:12px;
    height:50px;
    font-weight:600;
    margin-top:10px;
}

.success-message{
    background:#ecfdf5;
    color:#166534;
    border:1px solid #bbf7d0;
    border-radius:10px;
    padding:14px;
    margin-bottom:20px;
    font-size:14px;
}

.error-message{
    background:#fef2f2;
    color:#dc2626;
    border:1px solid #fecaca;
    border-radius:10px;
    padding:14px;
    margin-bottom:20px;
    font-size:14px;
}

.back-link{
    display:block;
    text-align:center;
    margin-top:25px;
    color:#0b5d3f;
    font-weight:600;
    text-decoration:none;
}

.back-link:hover{
    text-decoration:underline;
}

/* Mobile */
@media(max-width:480px){
    .forgot-card{
        padding:30px 24px;
    }
    h1{
        font-size:24px;
    }
}
</style>