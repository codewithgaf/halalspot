<?php

use Inertia\Testing\AssertableInertia as Assert;

test('guests can access the public homepage', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
        );
});
