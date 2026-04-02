<script setup lang="ts">
import IconBack from '~icons/material-symbols/arrow-back';
import IconSave from '~icons/material-symbols/save';
import IconRestore from '~icons/material-symbols/delete-history';
import IconPlus from '~icons/material-symbols/add';
import IconMinus from '~icons/material-symbols/remove';
import { reactive, ref, computed } from 'vue';
import { defaultSettings, defaultAdvancedSettings } from './types';
import type { TimerSettings, AdvancedSettings } from './types';

import Modal from './Modal.vue';

const showSaveModal = ref(false);
const showBackModal = ref(false);
const showResetImmediatelyModal = ref(false);
const activeTab = ref<'basic' | 'advanced'>('basic');

const emit = defineEmits<{
    switchView: [view: 'timer' | 'setting'];
    resetTimer: [];
    updateAdvancedSettings: [settings: AdvancedSettings];
}>();

const props = defineProps<{
    settings: TimerSettings;
    advancedSettings: AdvancedSettings;
    isTimerRunning: boolean;
}>();

const editingSettings = reactive<TimerSettings>({ ...props.settings });
const editingAdvanced = reactive<AdvancedSettings>({ ...props.advancedSettings });

function increaseSetting(key: keyof TimerSettings) {
    editingSettings[key]++;
}

function decreaseSetting(key: keyof TimerSettings) {
    if (editingSettings[key] > 1) {
        editingSettings[key]--;
    }
}

function increaseAdvanced(key: 'soundRepeatCount') {
    editingAdvanced[key]++;
}

function decreaseAdvanced(key: 'soundRepeatCount') {
    if (editingAdvanced[key] > 1) {
        editingAdvanced[key]--;
    }
}

const hasBasicChange = computed(() =>
    (Object.keys(editingSettings) as (keyof TimerSettings)[]).some(k => editingSettings[k] !== props.settings[k])
);

const hasAdvancedChange = computed(() =>
    (Object.keys(editingAdvanced) as (keyof AdvancedSettings)[]).some(k => editingAdvanced[k] !== props.advancedSettings[k])
);

const hasAnyChange = computed(() => hasBasicChange.value || hasAdvancedChange.value);

function saveSettings() {
    showSaveModal.value = true;
}

function resetSettings() {
    Object.assign(editingSettings, defaultSettings);
    Object.assign(editingAdvanced, defaultAdvancedSettings);
}

function goBack() {
    if (hasAnyChange.value) {
        showBackModal.value = true;
    } else {
        emit('switchView', 'timer');
    }
}

function isBasicChanged(key: keyof TimerSettings): boolean {
    return editingSettings[key] !== props.settings[key];
}

function isAdvancedChanged(key: keyof AdvancedSettings): boolean {
    return editingAdvanced[key] !== props.advancedSettings[key];
}

// Save modal
function onSaveConfirm() {
    emit('updateAdvancedSettings', { ...editingAdvanced });
    if (hasBasicChange.value) {
        Object.assign(props.settings, editingSettings);
        showSaveModal.value = false;
        showResetImmediatelyModal.value = true;
    } else {
        showSaveModal.value = false;
        emit('switchView', 'timer');
    }
}
function onSaveCancel() {
    showSaveModal.value = false;
}

// Back modal (unsaved changes)
function onBackConfirm() {
    showBackModal.value = false;
    emit('switchView', 'timer');
}
function onBackCancel() {
    showBackModal.value = false;
}

// Reset immediately modal
function onResetImmediatelyConfirm() {
    showResetImmediatelyModal.value = false;
    emit('resetTimer');
    emit('switchView', 'timer');
}
function onResetImmediatelyCancel() {
    showResetImmediatelyModal.value = false;
    emit('switchView', 'timer');
}

</script>
<template>
    <div class="main">
        <div class="top">
            <button class="btn-back" @click="goBack">
                <IconBack />
            </button>
            <div class="indicator" :class="{ blinking: isTimerRunning, hidden: !isTimerRunning }">
                Timer is running...
            </div>
            <button v-if="hasAnyChange" class="btn-save" @click="saveSettings">
                <IconSave />
            </button>
            <div v-else class="btn-save-placeholder"></div>
        </div>

        <div class="middle">
            <div class="setting-frame-mobile" v-if="activeTab === 'basic'">
                <div class="setting-item-big">
                    <label>Work</label>
                    <div class="count-input">
                        <button class="btn-minus" @click="decreaseSetting('workDuration')">
                            <IconMinus />
                        </button>
                        <div class="time-text" :class="{ changing: isBasicChanged('workDuration') }">
                            {{ editingSettings.workDuration }}
                        </div>
                        <button class="btn-plus" @click="increaseSetting('workDuration')">
                            <IconPlus />
                        </button>
                    </div>
                </div>

                <div class="setting-item-big">
                    <label>Short Break</label>
                    <div class="count-input">
                        <button class="btn-minus" @click="decreaseSetting('shortBreakDuration')">
                            <IconMinus />
                        </button>
                        <div class="time-text" :class="{ changing: isBasicChanged('shortBreakDuration') }">
                            {{ editingSettings.shortBreakDuration }}
                        </div>
                        <button class="btn-plus" @click="increaseSetting('shortBreakDuration')">
                            <IconPlus />
                        </button>
                    </div>
                </div>

                <div class="setting-item-big">
                    <label>Long Break</label>
                    <div class="count-input">
                        <button class="btn-minus" @click="decreaseSetting('longBreakDuration')">
                            <IconMinus />
                        </button>
                        <div class="time-text" :class="{ changing: isBasicChanged('longBreakDuration') }">
                            {{ editingSettings.longBreakDuration }}
                        </div>
                        <button class="btn-plus" @click="increaseSetting('longBreakDuration')">
                            <IconPlus />
                        </button>
                    </div>
                </div>

                <div class="setting-item">
                    <label>Break Interval</label>
                    <div class="count-input">
                        <button class="btn-minus" @click="decreaseSetting('sessionsBeforeLongBreak')">
                            <IconMinus />
                        </button>
                        <div class="time-text" :class="{ changing: isBasicChanged('sessionsBeforeLongBreak') }">
                            {{ editingSettings.sessionsBeforeLongBreak }}
                        </div>
                        <button class="btn-plus" @click="increaseSetting('sessionsBeforeLongBreak')">
                            <IconPlus />
                        </button>
                    </div>
                </div>
            </div>

            <div class="setting-frame-mobile" v-else>
                <div class="setting-item">
                    <label :class="{ changing: isAdvancedChanged('autoStartNextSession') }">Auto start next session</label>
                    <input type="checkbox" v-model="editingAdvanced.autoStartNextSession" />
                </div>
                <div class="setting-item">
                    <label :class="{ changing: isAdvancedChanged('enableSound') }">Enable sound</label>
                    <input type="checkbox" v-model="editingAdvanced.enableSound" />
                </div>
                <div class="setting-item" :class="{ 'disabled-item': !editingAdvanced.enableSound }">
                    <label :class="{ changing: isAdvancedChanged('soundRepeatCount') }">Sound repeat count</label>
                    <div class="count-input">
                        <button class="btn-minus" @click="decreaseAdvanced('soundRepeatCount')" :disabled="!editingAdvanced.enableSound">
                            <IconMinus />
                        </button>
                        <div class="time-text" :class="{ changing: isAdvancedChanged('soundRepeatCount') }">
                            {{ editingAdvanced.soundRepeatCount }}
                        </div>
                        <button class="btn-plus" @click="increaseAdvanced('soundRepeatCount')" :disabled="!editingAdvanced.enableSound">
                            <IconPlus />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="bottom">
            <button v-if="activeTab === 'basic'" class="btn-reset" @click="resetSettings">
                <IconRestore />
            </button>
            <div v-else class="btn-placeholder"></div>
            <div class="tabs">
                <button class="tab-btn" :class="{ active: activeTab === 'basic' }" @click="activeTab = 'basic'">Basic</button>
                <button class="tab-btn" :class="{ active: activeTab === 'advanced' }" @click="activeTab = 'advanced'">Advanced</button>
            </div>
        </div>
    </div>

    <Modal v-if="showSaveModal" question="Save settings?" @confirm="onSaveConfirm" @cancel="onSaveCancel" />
    <Modal v-if="showBackModal" question="Do you want to continue without saving?" @confirm="onBackConfirm"
        @cancel="onBackCancel" />
    <Modal v-if="showResetImmediatelyModal" question="Reset timer immediately?" @confirm="onResetImmediatelyConfirm"
        @cancel="onResetImmediatelyCancel" />

</template>

<style scoped lang="scss">
.main {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
    background-color: var(--dark-color);
    color: var(--bright-color);
    padding: 10vh;
}

.top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.middle {
    padding: 0 10vw;

    .setting-frame-mobile {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
}

.bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
}

.btn-placeholder {
    width: 3.5rem;
    height: 3.5rem;
}

.tabs {
    display: flex;
    gap: 0.25rem;

    .tab-btn {
        font-size: 1rem;
        padding: 0.4rem 1.1rem;
        border-radius: 2rem;
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: var(--bright-color);
        opacity: 0.45;
        transition: opacity 0.15s, border-color 0.15s;

        &.active {
            opacity: 1;
            border-color: var(--bright-color);
        }

        &:hover {
            opacity: 0.8;
        }
    }
}

button {
    background: transparent;
    border: none;
    color: var(--bright-color);
    cursor: pointer;
    font-size: 3rem;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        opacity: 0.7;
    }
}

.btn-back,
.btn-save,
.btn-reset {
    font-size: 2.5rem;
}

.indicator {
    font-size: 1.5rem;
    color: var(--warning-color);

    &.hidden {
        visibility: hidden;
    }

    &.blinking {
        animation: blink 1s step-start infinite;
    }
}

.btn-save-placeholder {
    width: 3.5rem;
    height: 3.5rem;
}

@keyframes blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }
}

.setting-item-big {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 0;

    label {
        font-size: 1.5rem;
        font-weight: 400;
    }

    .count-input {
        display: flex;
        gap: 1rem;

        .time-text {
            font-size: 3rem;
            text-align: center;
            width: 4ch;
        }

        .btn-minus,
        .btn-plus {
            font-size: 2rem;
        }
    }
}

.setting-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    label {
        font-size: 1.5rem;
        font-weight: 400;
    }

    .count-input {
        display: flex;
        justify-content: center;
        align-items: center;

        .time-text {
            font-size: 1.25rem;
            text-align: center;
            width: 2ch;
        }

        .btn-minus,
        .btn-plus {
            font-size: 1.25rem;
        }
    }

    input[type="checkbox"] {
        width: 1.5rem;
        height: 1.5rem;
        accent-color: var(--bright-color);
        cursor: pointer;
        flex-shrink: 0;
    }
}

.disabled-item {
    opacity: 0.35;
}

button:disabled {
    cursor: not-allowed;
    pointer-events: none;
}

.changing {
    color: var(--warning-color);
}
</style>