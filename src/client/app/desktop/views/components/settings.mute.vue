<template>
<div>
	<div class="none ui info" v-if="!fetching && users.length == 0">
		<p>%fa:info-circle%%i18n:@no-users%</p>
	</div>
	<div class="users" v-if="users.length != 0">
		<div v-for="user in users" :key="user.id">
			<p><b>{{ user | userName }}</b> @{{ user | acct }}</p>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	data() {
		return {
			fetching: true,
			users: []
		};
	},
	mounted() {
		(this as any).api('mute/list').then(x => {
			this.users = x.users;
			this.fetching = false;
		});
	}
});
</script>
